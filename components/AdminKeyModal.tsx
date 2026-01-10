'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, Save } from 'lucide-react';
import { RoomKey, Room } from '@/types';

interface AdminKeyModalProps {
  keyData?: RoomKey | null;
  rooms: Room[];
  close: () => void;
  onSuccess: () => void;
}

export default function AdminKeyModal({ keyData, rooms, close, onSuccess }: AdminKeyModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    key_number: keyData?.key_number || '',
    room_id: keyData?.room_id || (rooms[0]?.id || ''),
    status: (keyData?.status || 'available') as 'available' | 'issued' | 'lost',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (keyData) {
        // Update
        const { error } = await supabase
          .from('room_keys')
          .update(formData)
          .eq('id', keyData.id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('room_keys')
          .insert([formData]);
        if (error) throw error;
      }

      alert(`Key ${keyData ? 'updated' : 'added'} successfully!`);
      onSuccess();
      close();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'An unknown error occurred';
      alert('Error: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">
            {keyData ? 'Edit Key' : 'Add New Key'}
          </h2>
          <button onClick={close} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="text-gray-500" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Number / Label</label>
            <input
              required
              className="input-field"
              placeholder="e.g. 301-A"
              value={formData.key_number}
              onChange={(e) => setFormData({ ...formData, key_number: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Room</label>
            <select 
              className="input-field"
              value={formData.room_id}
              onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
            >
              <option value="" disabled>Select a room</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.room_number} ({room.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              className="input-field"
              value={formData.status}
              // FIX: Explicitly cast the value to the literal union type
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'issued' | 'lost' })}
            >
              <option value="available">Available</option>
              <option value="issued">Issued</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={close} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}