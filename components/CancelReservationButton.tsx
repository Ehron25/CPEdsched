'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { differenceInHours } from 'date-fns';
import { Reservation, Room } from '@/types'; 
import { X, Trash2 } from 'lucide-react';

const CANCEL_REASONS = [
  "Professor canceled/rescheduled",
  "Wrong schedule selected",
  "Conflict discovered",
  "Equipment no longer needed",
  "Class suspended/Holiday",
  "Other"
];

// Fix: Omit 'room' from Reservation before redefining it to avoid conflict
interface ReservationWithKey extends Omit<Reservation, 'room'> {
  key_issuance?: { status: string }[];
  room?: Room | { room_number: string }; // Allow partial or full room
}

export default function CancelReservationButton({ reservation }: { reservation: ReservationWithKey }) {
  const [cancelling, setCancelling] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [otherReason, setOtherReason] = useState('');
  
  const supabase = createClient();

  const reservationStart = new Date(`${reservation.date_reserved}T${reservation.time_start}`);
  const now = new Date();
  const hoursUntilStart = differenceInHours(reservationStart, now);
  
  // Check if key is issued
  const isKeyIssued = reservation.key_issuance?.some((k) => k.status === 'issued');

  // Logic: 
  // 1. Must be at least 1 hour before
  // 2. Status must be pending or verified
  // 3. Key must NOT be issued
  const canCancel = 
    hoursUntilStart >= 1 && 
    ['pending', 'verified'].includes(reservation.status) &&
    !isKeyIssued;

  const handleCancel = async () => {
    const finalReason = reason === "Other" ? otherReason : reason;
    if (!finalReason) return alert("Please provide a reason.");

    setCancelling(true);
    await supabase
      .from('reservations')
      .update({ 
        status: 'cancelled',
        cancel_reason: finalReason,
        cancelled_by: reservation.user_id,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', reservation.id);
    
    // --- Notify Admins ---
    const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
    if (admins && admins.length > 0) {
      const adminNotifs = admins.map(admin => ({
        user_id: admin.id,
        title: 'Reservation Cancelled',
        message: `Student cancelled reservation for ${reservation.subject_code} (Room ${reservation.room?.room_number || 'Unknown'}). Reason: ${finalReason}`,
        type: 'warning'
      }));
      await supabase.from('notifications').insert(adminNotifs);
    }
    // ---------------------

    // Notify Professor
    await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cancelled',
          to: reservation.professor_email,
          details: {
            professor_name: reservation.professor_name,
            subject_code: reservation.subject_code
          },
          reason: finalReason
        })
    });

    setCancelling(false);
    setShowModal(false);
    window.location.reload();
  };

  if (reservation.status === 'cancelled') return <span className="text-gray-400 italic">Cancelled</span>;
  
  // If key is issued, show specific message
  if (isKeyIssued) {
    return <span className="text-orange-500 text-xs font-medium">Key Released</span>;
  }

  // If too late to cancel
  if (hoursUntilStart < 1 && ['pending', 'verified'].includes(reservation.status)) {
    return <span className="text-gray-400 text-xs">Too late to cancel</span>;
  }
  
  if (!canCancel) return null; 

  return (
    <>
      <button 
        onClick={() => setShowModal(true)} 
        className="text-red-600 hover:text-red-800 p-1 transition-colors"
        title="Cancel Reservation"
      >
        <Trash2 size={16} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Cancel Reservation</h3>
              <button onClick={() => setShowModal(false)}><X className="text-gray-500"/></button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">Please select a reason for cancellation:</p>
            
            <select 
              className="input-field mb-3" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
            >
              {CANCEL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {reason === "Other" && (
              <textarea 
                className="input-field mb-4 h-24" 
                placeholder="Please specify..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
              />
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary text-sm">Keep</button>
              <button onClick={handleCancel} disabled={cancelling} className="btn bg-red-600 text-white hover:bg-red-700 text-sm">
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}