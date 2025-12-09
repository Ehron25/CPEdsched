'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, AlertTriangle, Send } from 'lucide-react';
import { Room, Equipment } from '@/types';

interface ReportModalProps {
  close: () => void;
  prefillRoomId?: string;
  prefillReservationId?: string;
}

export default function ReportIssueModal({ close, prefillRoomId, prefillReservationId }: ReportModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  
  const [formData, setFormData] = useState({
    type: 'room', // 'room' | 'equipment' | 'other'
    title: '',
    description: '',
    room_id: prefillRoomId || '',
    equipment_id: '', // CHANGED: from equipment_item_id
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch rooms
      const { data: roomData } = await supabase.from('rooms').select('*').order('room_number');
      if (roomData) setRooms(roomData as Room[]);

      // Fetch equipment
      const { data: eqData } = await supabase.from('equipment').select('*').order('name');
      if (eqData) setEquipmentList(eqData as Equipment[]);
    };
    fetchData();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('incident_reports').insert({
        reporter_id: user.id,
        reservation_id: prefillReservationId || null,
        room_id: formData.type === 'room' ? formData.room_id : null,
        equipment_id: formData.type === 'equipment' ? formData.equipment_id : null, // CHANGED
        type: formData.type,
        title: formData.title,
        description: formData.description,
      });

      if (error) throw error;
      
      // Notify Admins
      const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
      if (admins) {
        const notifs = admins.map(a => ({
            user_id: a.id,
            title: 'New Incident Report',
            message: `${formData.type.toUpperCase()}: ${formData.title}`,
            type: 'error'
        }));
        await supabase.from('notifications').insert(notifs);
      }

      alert("Report submitted successfully.");
      close();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'An unknown error occurred';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-6 border-b flex justify-between items-center bg-red-50">
          <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
            <AlertTriangle size={24} /> Report an Issue
          </h2>
          <button onClick={close}><X className="text-gray-500" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
            <div className="flex gap-4">
                {['room', 'equipment', 'other'].map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="type" 
                            value={t} 
                            checked={formData.type === t}
                            onChange={e => setFormData({...formData, type: e.target.value})}
                            className="text-primary focus:ring-primary" 
                        />
                        <span className="capitalize">{t}</span>
                    </label>
                ))}
            </div>
          </div>

          {formData.type === 'room' && (
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Affected Room</label>
                <select 
                    className="input-field" 
                    value={formData.room_id} 
                    onChange={e => setFormData({...formData, room_id: e.target.value})}
                    required={formData.type === 'room'}
                >
                    <option value="">Select Room</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                </select>
             </div>
          )}

          {/* NEW: Equipment Selector */}
          {formData.type === 'equipment' && (
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Affected Equipment</label>
                <select 
                    className="input-field" 
                    value={formData.equipment_id} 
                    onChange={e => setFormData({...formData, equipment_id: e.target.value})}
                    required={formData.type === 'equipment'}
                >
                    <option value="">Select Equipment</option>
                    {equipmentList.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
             </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Title</label>
            <input 
                required 
                className="input-field" 
                placeholder={formData.type === 'equipment' ? "e.g. Broken Projector" : "e.g. AC leaking"}
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
                required 
                className="input-field h-24" 
                placeholder="Please describe the issue in detail..." 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={close} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn bg-red-600 text-white hover:bg-red-700">
                <Send size={16} /> Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}