'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, Save, Trash2 } from 'lucide-react';
import { Equipment } from '@/types';

interface AdminEquipmentModalProps {
  equipment?: Equipment | null;
  close: () => void;
  onSuccess: () => void;
}

export default function AdminEquipmentModal({ equipment, close, onSuccess }: AdminEquipmentModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: equipment?.name || '',
    total_quantity: equipment?.total_quantity || 0,
    available_quantity: equipment?.available_quantity || 0,
    status: (equipment?.status || 'active') as 'active' | 'maintenance',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (equipment) {
        const { error } = await supabase.from('equipment').update(formData).eq('id', equipment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('equipment').insert([formData]);
        if (error) throw error;
      }
      alert('Equipment saved successfully!');
      onSuccess();
      close();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'An unknown error occurred';
      alert('Error: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!equipment || !confirm('Delete this equipment category? This will delete all associated items!')) return;
    try {
        const { error } = await supabase.from('equipment').delete().eq('id', equipment.id);
        if (error) throw error;
        onSuccess();
        close();
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'An unknown error occurred';
        alert('Error: ' + msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">{equipment ? 'Edit Category' : 'Add Equipment Category'}</h2>
          <button onClick={close}><X className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name</label>
            <input required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Projector" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Qty</label>
                <input type="number" className="input-field" value={formData.total_quantity} onChange={e => setFormData({...formData, total_quantity: parseInt(e.target.value)})} />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Qty</label>
                <input type="number" className="input-field" value={formData.available_quantity} onChange={e => setFormData({...formData, available_quantity: parseInt(e.target.value)})} />
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
                className="input-field" 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'maintenance'})}
            >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex justify-between pt-2">
            {equipment ? (
                <button type="button" onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"><Trash2 size={16}/> Delete</button>
            ) : <div></div>}
            <div className="flex gap-2">
                <button type="button" onClick={close} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary"><Save size={18}/> Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}