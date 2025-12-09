'use client';
import { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, BookOpen, Search, AlertCircle, Edit } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Equipment, Reservation } from '@/types';
import { format } from 'date-fns';

interface EditReservationModalProps {
  reservation: Reservation;
  closeModal: () => void;
  onSuccess: () => void;
}

interface ReservationConflict {
  id: string;
  reservation_equipment: {
    equipment_id: string;
    quantity_requested: number;
  }[];
}

export default function EditReservationModal({ reservation, closeModal, onSuccess }: EditReservationModalProps) {
  const [supabase] = useState(() => createClient());
  const [loading, setLoading] = useState(false);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [availableQuantities, setAvailableQuantities] = useState<Record<string, number>>({});
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [equipmentNeeds, setEquipmentNeeds] = useState<Record<string, number>>({});

  // Check if reservation can still be edited (before end time)
  const canEdit = useMemo(() => {
    const now = new Date();
    const reservationDate = new Date(reservation.date_reserved);
    const [endHour, endMinute] = reservation.time_end.split(':').map(Number);
    reservationDate.setHours(endHour, endMinute, 0, 0);
    
    return now < reservationDate;
  }, [reservation]);

  useEffect(() => {
    const initData = async () => {
      // Fetch equipment list
      const { data: eqData } = await supabase
        .from('equipment')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (eqData) {
        setEquipmentList(eqData as Equipment[]);
        const initialMap: Record<string, number> = {};
        eqData.forEach((eq: Equipment) => {
          initialMap[eq.id] = eq.total_quantity;
        });
        setAvailableQuantities(initialMap);
      }

      // Fetch current equipment for this reservation
      const { data: currentEquipment } = await supabase
        .from('reservation_equipment')
        .select('equipment_id, quantity_requested')
        .eq('reservation_id', reservation.id);

      if (currentEquipment) {
        const currentMap: Record<string, number> = {};
        currentEquipment.forEach((item: { equipment_id: string; quantity_requested: number }) => {
          currentMap[item.equipment_id] = item.quantity_requested;
        });
        setEquipmentNeeds(currentMap);
      }
    };
    initData();
  }, [supabase, reservation.id]);

  // Calculate Equipment Availability
  useEffect(() => {
    if (!reservation.date_reserved) return;

    const checkEquipmentAvailability = async () => {
      const { data } = await supabase
        .from('reservations')
        .select(`id, reservation_equipment ( equipment_id, quantity_requested )`)
        .eq('date_reserved', reservation.date_reserved)
        .neq('status', 'cancelled')
        .neq('status', 'rejected')
        .neq('id', reservation.id) // Exclude current reservation
        .lt('time_start', reservation.time_end)
        .gt('time_end', reservation.time_start);

      const conflicts = data as unknown as ReservationConflict[];
      const usedMap: Record<string, number> = {};

      if (conflicts) {
        conflicts.forEach(res => {
          const items = Array.isArray(res.reservation_equipment) ? res.reservation_equipment : [];
          items.forEach((req) => {
            usedMap[req.equipment_id] = (usedMap[req.equipment_id] || 0) + req.quantity_requested;
          });
        });
      }

      const newAvailability: Record<string, number> = {};
      equipmentList.forEach(eq => {
        const used = usedMap[eq.id] || 0;
        const currentlyUsed = equipmentNeeds[eq.id] || 0;
        const remaining = Math.max(0, eq.total_quantity - used + currentlyUsed);
        newAvailability[eq.id] = remaining;
      });

      setAvailableQuantities(newAvailability);
    };

    checkEquipmentAvailability();
  }, [equipmentList, supabase, reservation, equipmentNeeds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit) {
      alert('This reservation can no longer be edited as the end time has passed.');
      return;
    }

    // Validate equipment availability
    for (const [eqId, qty] of Object.entries(equipmentNeeds)) {
      if (qty > 0 && qty > (availableQuantities[eqId] || 0)) {
        const eqName = equipmentList.find(e => e.id === eqId)?.name;
        return alert(`Error: Only ${availableQuantities[eqId]} ${eqName}(s) are available for the selected time.`);
      }
    }

    setLoading(true);

    try {
      // Delete existing equipment entries
      await supabase
        .from('reservation_equipment')
        .delete()
        .eq('reservation_id', reservation.id);

      // Insert new equipment entries
      const equipmentInserts = Object.entries(equipmentNeeds)
        .filter(([, qty]) => qty > 0)
        .map(([eqId, qty]) => ({
          reservation_id: reservation.id,
          equipment_id: eqId,
          quantity_requested: qty
        }));

      if (equipmentInserts.length > 0) {
        await supabase.from('reservation_equipment').insert(equipmentInserts);
      }

      // Notify Admins about the edit
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        const { data: studentProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', reservation.user_id)
          .single();

        const { data: roomData } = await supabase
          .from('rooms')
          .select('room_number')
          .eq('id', reservation.room_id)
          .single();

        const adminNotifications = admins.map(admin => ({
          user_id: admin.id,
          title: 'Reservation Edited',
          message: `${studentProfile?.full_name || 'A student'} edited their reservation for Room ${roomData?.room_number || reservation.room_id} (${reservation.subject_code}) on ${format(new Date(reservation.date_reserved), 'MMM dd, yyyy')}.`,
          type: 'info'
        }));
        await supabase.from('notifications').insert(adminNotifications);
      }

      alert('Reservation updated successfully!');
      onSuccess();
      closeModal();
    } catch (error: unknown) {
      if (error instanceof Error) alert(error.message);
      else alert('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipmentList.filter(eq =>
    eq.name.toLowerCase().includes(equipmentSearch.toLowerCase())
  );

  if (!canEdit) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="text-red-500" size={24} />
              Cannot Edit
            </h2>
            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="text-gray-500" />
            </button>
          </div>
          <p className="text-gray-600 mb-4">
            This reservation can no longer be edited as the end time has passed.
          </p>
          <button onClick={closeModal} className="btn btn-primary w-full">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
        <div className="p-6 border-b flex justify-between items-center bg-linear-to-r from-primary/5 to-white shrink-0">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Edit className="text-primary" size={24} />
              Edit Reservation
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Reservation #{reservation.reservation_number || reservation.id.slice(0, 8)}
            </p>
          </div>
          <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <form id="edit-reservation-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Reservation Details (Read-only) */}
            <div className="space-y-4">
              <h3 className="text-sm uppercase font-bold text-gray-500 border-b pb-2 flex items-center gap-2">
                <BookOpen size={16} /> Reservation Details
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Room</label>
                  <div className="text-gray-900 font-medium">{reservation.room?.room_number || 'Loading...'}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Subject Code</label>
                  <div className="text-gray-900 font-medium">{reservation.subject_code}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                    <Calendar size={12} /> Date
                  </label>
                  <div className="text-gray-900 font-medium">
                    {format(new Date(reservation.date_reserved), 'MMM dd, yyyy')}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                    <Clock size={12} /> Time
                  </label>
                  <div className="text-gray-900 font-medium">
                    {reservation.time_start} - {reservation.time_end}
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Professor</label>
                  <div className="text-gray-900 font-medium">{reservation.professor_name}</div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>
                  You can edit equipment needs as long as your reservation end time hasn&apos;t passed yet.
                </span>
              </div>
            </div>

            {/* Equipment Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                <h3 className="text-sm uppercase font-bold text-gray-500 flex items-center gap-2">
                  Equipment Checklist
                </h3>

                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={14} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search equipment..."
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={equipmentSearch}
                    onChange={(e) => setEquipmentSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredEquipment.map(eq => {
                    const available = availableQuantities[eq.id] ?? 0;
                    return (
                      <div key={eq.id} className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:border-primary/30 transition-colors">
                        <div className="min-w-0 flex-1 mr-2">
                          <span className="font-medium text-gray-900 block truncate" title={eq.name}>{eq.name}</span>
                          <div className={`text-xs font-medium ${available > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {available} available
                          </div>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max={available}
                          className="w-16 border border-gray-300 rounded-md p-1.5 text-center text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
                          placeholder="0"
                          value={equipmentNeeds[eq.id] || ''}
                          disabled={available === 0 && !equipmentNeeds[eq.id]}
                          onChange={e => {
                            let val = parseInt(e.target.value);
                            if (isNaN(val) || val < 0) val = 0;
                            if (val > available) val = available;

                            setEquipmentNeeds(prev => ({
                              ...prev,
                              [eq.id]: val
                            }));
                          }}
                        />
                      </div>
                    );
                  })}

                  {filteredEquipment.length === 0 && (
                    <div className="col-span-full py-8 text-center text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                      No equipment found matching &quot;{equipmentSearch}&quot;
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white shrink-0 z-10 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
          <button
            type="submit"
            form="edit-reservation-form"
            disabled={loading}
            className="btn btn-primary min-w-[140px] shadow-lg"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
