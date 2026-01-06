'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, Save } from 'lucide-react';
import { Room, RoomStatus } from '@/types';

// Define available amenities
const AVAILABLE_FEATURES = [
  "Air Conditioning",
  "Smart TV",
  "Projector",
  "Computers",
  "Whiteboard",
  "Laboratory Equipment"
];

interface AdminRoomModalProps {
  room?: Room | null;
  close: () => void;
  onSuccess: () => void;
}

export default function AdminRoomModal({ room, close, onSuccess }: AdminRoomModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    room_number: room?.room_number || '',
    type: room?.type || 'Lecture Room',
    capacity: room?.capacity || 30,
    floor: room?.floor || '1st',
    status: (room?.status || 'available') as RoomStatus,
    description: room?.description || '',
    features: room?.features || [] as string[], // Initialize features
  });

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => {
      const exists = prev.features.includes(feature);
      return {
        ...prev,
        features: exists 
          ? prev.features.filter(f => f !== feature) // Remove
          : [...prev.features, feature] // Add
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (room) {
        const { error } = await supabase
          .from('rooms')
          .update(formData)
          .eq('id', room.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('rooms')
          .insert([formData]);
        if (error) throw error;
      }

      alert(`Room ${room ? 'updated' : 'added'} successfully!`);
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {room ? 'Edit Room' : 'Add New Room'}
          </h2>
          <button onClick={close} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="text-gray-500" size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto">
          <form id="room-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input
                  required
                  className="input-field"
                  placeholder="e.g. 301"
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                <select 
                  className="input-field"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                >
                  <option value="1st">1st Floor</option>
                  <option value="2nd">2nd Floor</option>
                  <option value="3rd">3rd Floor</option>
                  <option value="4th">4th Floor</option>
                  <option value="5th">5th Floor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input
                  required
                  className="input-field"
                  placeholder="e.g. Laboratory"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  required
                  type="number"
                  className="input-field"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                className="input-field"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomStatus })}
              >
                <option value="available">Available</option>
                {/* <option value="occupied">Occupied</option> */}
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* --- NEW FEATURES SECTION --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Features</label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_FEATURES.map((feature) => (
                  <label key={feature} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      className="rounded text-primary focus:ring-primary"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="input-field h-24 resize-none"
                placeholder="Room details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
          <button type="button" onClick={close} className="btn btn-secondary">Cancel</button>
          <button type="submit" form="room-form" disabled={loading} className="btn btn-primary">
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Room'}
          </button>
        </div>
      </div>
    </div>
  );
}