'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, Check, Key, RotateCcw, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { ReservationWithDetails } from '@/types';

const DECLINE_REASONS = [
  "Room under maintenance",
  "Conflict with college event",
  "Inappropriate purpose",
  "Professor denied schedule",
  "Equipment unavailable",
  "Other"
];

interface AdminModalProps {
  reservation: ReservationWithDetails;
  close: () => void;
  mode: 'pending' | 'history' | 'cancelled' | 'keys' | 'students';
}

interface EmailPayload {
  to: string;
  name?: string;
  resNum?: string;
  reason?: string;
  details?: {
    professor_name?: string;
    room_number?: string;
    date?: string;
    subject_code?: string;
    room?: { room_number: string };
  } | ReservationWithDetails; 
}

export default function AdminRequestModal({ reservation, close, mode }: AdminModalProps) {
  const supabase = createClient();
  const [processing, setProcessing] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [selectedReason, setSelectedReason] = useState(DECLINE_REASONS[0]);

  // Helper to create notifications
  const createNotification = async (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    await supabase.from('notifications').insert({ user_id: userId, title, message, type });
  };

  // Helper for Audit Logs
  const logAction = async (action: string, details: object) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('audit_logs').insert({
        admin_id: user.id,
        action,
        entity_id: reservation.id,
        details
      });
    }
  };

  const sendEmail = async (type: 'approved' | 'rejected', data: EmailPayload) => {
    try {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...data })
      });
    } catch (e) {
      console.error("Failed to send email", e);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const dateStr = reservation.date_reserved.replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const resNum = `CPE-${dateStr}-${randomSuffix}`;

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('reservations')
        .update({
          status: 'verified',
          reservation_number: resNum,
          verified_by: user?.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', reservation.id);

      if (error) throw error;
      
      // 1. Log to Audit Trail
      await logAction('Reservation Approved', { 
        reservation_number: resNum, 
        subject: reservation.subject_code,
        room: reservation.room.room_number
      });
      
      // 2. Send Notification
      await createNotification(
        reservation.user_id,
        'Reservation Approved',
        `Your reservation for ${reservation.subject_code} (Room ${reservation.room.room_number}) has been approved.`,
        'success'
      );

      // 3. Send Email
      await sendEmail('approved', { 
        to: reservation.profile.email, 
        name: reservation.profile.full_name,
        resNum,
        details: reservation 
      });

      alert(`Reservation Approved! Number: ${resNum}`);
      close();
    } catch (error) {
      console.error(error);
      alert('Error approving reservation');
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    const finalReason = selectedReason === "Other" ? declineReason : selectedReason;
    if(!finalReason) return alert("Please provide a reason.");
    
    setProcessing(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('reservations').update({
      status: 'rejected',
      verified_by: user?.id,
      cancel_reason: finalReason 
    }).eq('id', reservation.id);

    // 1. Log to Audit Trail
    await logAction('Reservation Declined', { 
      reason: finalReason, 
      subject: reservation.subject_code 
    });

    // 2. Send Notification
    await createNotification(
      reservation.user_id,
      'Reservation Declined',
      `Your request for ${reservation.subject_code} was declined: ${finalReason}`,
      'error'
    );

    await sendEmail('rejected', { 
      to: reservation.profile.email, 
      name: reservation.profile.full_name,
      reason: finalReason 
    });

    close();
  };

  const handleIssueKey = async () => {
    setProcessing(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: keys } = await supabase.from('room_keys').select('id').eq('room_id', reservation.room_id).eq('status', 'available').limit(1);

    if (!keys || keys.length === 0) {
      alert("No available keys for this room!");
      setProcessing(false);
      return;
    }

    const { error } = await supabase.from('key_issuance').insert({
      reservation_id: reservation.id,
      key_id: keys[0].id,
      student_id: reservation.user_id,
      issued_by: user?.id,
      status: 'issued'
    });

    if (!error) {
      await supabase.from('room_keys').update({ status: 'issued' }).eq('id', keys[0].id);
      
      // 1. Log to Audit Trail
      await logAction('Key Issued', { 
        room: reservation.room.room_number,
        student: reservation.profile.full_name
      });

      // 2. Send Notification
      await createNotification(
         reservation.user_id,
         'Key Issued',
         `Room key for ${reservation.room.room_number} has been issued. Please return it after class.`,
         'info'
      );

      alert("Key Issued Successfully");
      close();
    }
    setProcessing(false);
  };

  const handleReturnKey = async () => {
    setProcessing(true);
    
    const { data: issuance } = await supabase
      .from('key_issuance')
      .select('id, key_id')
      .eq('reservation_id', reservation.id)
      .eq('status', 'issued')
      .single();

    if (issuance) {
      await supabase.from('key_issuance').update({ 
        status: 'returned', 
        returned_at: new Date().toISOString() 
      }).eq('id', issuance.id);

      await supabase.from('room_keys').update({ status: 'available' }).eq('id', issuance.key_id);
    }

    await supabase.from('reservations').update({ status: 'completed' }).eq('id', reservation.id);

    // 1. Log to Audit Trail
    await logAction('Key Returned', { 
      room: reservation.room.room_number,
      completed: true
    });

    alert("Key Returned & Reservation Completed");
    close();
    setProcessing(false);
  };

  const isKeyIssued = reservation.key_issuance?.some(k => k.status === 'issued');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-linear-to-r from-primary/5 to-white shrink-0">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="text-primary" size={24} />
              Manage Reservation
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
               {reservation.reservation_number ? (
                 <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                   {reservation.reservation_number}
                 </span>
               ) : (
                 <span className="text-xs italic text-gray-400">No Reference #</span>
               )}
               <span className="text-sm text-gray-500">• Room {reservation.room?.room_number}</span>
            </div>
          </div>
          <button onClick={close} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="text-gray-500" /></button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto overflow-x-hidden flex-1">
          {/* Student Info */}
          <div>
            <h3 className="text-xs uppercase font-bold text-gray-500 mb-2 border-b pb-1">Student Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm break-all">
              <p><span className="font-semibold text-gray-700">Name:</span> {reservation.profile?.full_name}</p>
              <p><span className="font-semibold text-gray-700">Student #:</span> {reservation.profile?.student_number}</p>
              <p><span className="font-semibold text-gray-700">Program:</span> {reservation.profile?.program}</p>
              <p><span className="font-semibold text-gray-700">Year/Sec:</span> {reservation.profile?.year_section}</p>
              <p><span className="font-semibold text-gray-700">Contact:</span> {reservation.profile?.contact_number}</p>
              <p className="truncate"><span className="font-semibold text-gray-700">Email:</span> {reservation.profile?.email}</p>
            </div>
          </div>

          {/* Reservation Details */}
          <div>
            <h3 className="text-xs uppercase font-bold text-gray-500 mb-2 border-b pb-1">Class Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm break-all">
              <p><span className="font-semibold text-gray-700">Subject:</span> {reservation.subject_code}</p>
              <p><span className="font-semibold text-gray-700">Room:</span> {reservation.room?.room_number}</p>
              <p><span className="font-semibold text-gray-700">Date:</span> {reservation.date_reserved ? format(new Date(reservation.date_reserved), 'MMM dd, yyyy') : 'N/A'}</p>
              <p><span className="font-semibold text-gray-700">Time:</span> {reservation.time_start} - {reservation.time_end}</p>
            </div>
          </div>

          {/* Professor */}
          <div>
            <h3 className="text-xs uppercase font-bold text-gray-500 mb-2 border-b pb-1">Professor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm break-all">
              <p><span className="font-semibold text-gray-700">Name:</span> {reservation.professor_name}</p>
              <p className="truncate"><span className="font-semibold text-gray-700">Email:</span> {reservation.professor_email}</p>
              <p><span className="font-semibold text-gray-700">Contact:</span> {reservation.professor_contact_number || 'N/A'}</p>
              <p className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Status: </span> 
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                  reservation.professor_status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                  reservation.professor_status === 'declined' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {reservation.professor_status || 'Pending'}
                </span>
              </p>
            </div>
          </div>

          {/* Equipment */}
          <div>
            <h3 className="text-xs uppercase font-bold text-gray-500 mb-2 border-b pb-1">Equipment</h3>
            {reservation.equipment && reservation.equipment.length > 0 ? (
              <ul className="text-sm list-disc pl-4 space-y-1">
                {reservation.equipment.map((eq, i) => (
                  <li key={i}><span className="font-medium">{eq.equipment.name}</span> <span className="text-gray-500">(Qty: {eq.quantity_requested})</span></li>
                ))}
              </ul>
            ) : (
              <span className="text-sm text-gray-400 italic">No equipment requested.</span>
            )}
          </div>

          {reservation.cancel_reason && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-800 text-sm">
              <span className="font-bold block mb-1">Rejection Reason:</span> 
              {reservation.cancel_reason}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {mode === 'pending' ? (
            <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Decline Action</label>
                 <select 
                   className="input-field text-sm"
                   value={selectedReason}
                   onChange={(e) => {
                     setSelectedReason(e.target.value);
                     setDeclineReason(e.target.value === "Other" ? "" : "");
                   }}
                 >
                   {DECLINE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
               </div>
               
               <div className="flex flex-col sm:flex-row gap-3">
                  {selectedReason === "Other" && (
                    <input 
                      placeholder="Please specify reason..." 
                      className="input-field text-sm py-2 flex-1"
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                    />
                  )}
                  
                  <div className={`flex gap-2 shrink-0 ${selectedReason !== "Other" ? "w-full justify-end" : ""}`}>
                    <button onClick={handleDecline} disabled={processing} className="btn bg-red-100 text-red-700 hover:bg-red-200 border border-red-200">
                      Decline
                    </button>
                    <button onClick={handleApprove} disabled={processing} className="btn btn-primary shadow-sm">
                      <Check size={18} /> Approve
                    </button>
                  </div>
               </div>
            </div>
          ) : mode === 'keys' ? (
            <div className="flex gap-3 justify-end">
              {!isKeyIssued ? (
                <button onClick={handleIssueKey} disabled={processing} className="btn bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm">
                  <Key size={18} /> Issue Key
                </button>
              ) : (
                <button onClick={handleReturnKey} disabled={processing} className="btn bg-green-600 text-white hover:bg-green-700 shadow-sm">
                  <RotateCcw size={18} /> Return Key & Complete
                </button>
              )}
            </div>
          ) : (
            <div className="flex justify-end">
              <button onClick={close} className="btn btn-secondary text-sm">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}