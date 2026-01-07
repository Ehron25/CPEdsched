'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, Save } from 'lucide-react';

interface AdminBlockDateModalProps {
  close: () => void;
  onSuccess: () => void;
}

export default function AdminBlockDateModal({ close, onSuccess }: AdminBlockDateModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    reason: 'Holiday',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.end_date < formData.start_date) {
        alert("End date cannot be before start date.");
        setLoading(false);
        return;
    }

    try {
      const { error } = await supabase.from('blocked_dates').insert([formData]);
      if (error) throw error;
      
      alert('Date range blocked successfully!');
      onSuccess();
      close();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'An error occurred';
      alert('Error: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Block Dates</h2>
          <button onClick={close}><X className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input 
                required 
                type="date" 
                className="input-field" 
                value={formData.start_date}
                min={new Date().toISOString().split('T')[0]} 
                onChange={e => setFormData({
                    ...formData, 
                    start_date: e.target.value,
                    // Auto-set end date if empty or before start
                    end_date: (!formData.end_date || formData.end_date < e.target.value) ? e.target.value : formData.end_date
                })} 
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input 
                required 
                type="date" 
                className="input-field" 
                value={formData.end_date}
                min={formData.start_date || new Date().toISOString().split('T')[0]} 
                onChange={e => setFormData({...formData, end_date: e.target.value})} 
                />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <input 
              required 
              className="input-field" 
              value={formData.reason} 
              onChange={e => setFormData({...formData, reason: e.target.value})} 
              placeholder="e.g. Semester Break" 
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={close} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary"><Save size={18}/> Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}