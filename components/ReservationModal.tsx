'use client';
import { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, User, BookOpen, Search, ExternalLink, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Room, Equipment, Profile } from '@/types';

interface ModalProps {
  room: Room;
  closeModal: () => void;
}

interface ReservationConflict {
  id: string;
  reservation_equipment: {
    equipment_id: string;
    quantity_requested: number;
  }[];
}

// --- Helper Functions ---

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const formatTime = (hour: number, minute: number) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
};

// Helper to generate an array of YYYY-MM-DD strings between two dates
const getDaysArray = (start: string, end: string) => {
  const arr = [];
  const dt = new Date(start);
  const endDt = new Date(end);
  while (dt <= endDt) {
      arr.push(dt.toISOString().split('T')[0]);
      dt.setDate(dt.getDate() + 1);
  }
  return arr;
};

// Helper to check if a specific time is in the past (relative to now)
const isTimePast = (timeStr: string) => {
    const now = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // Create a date object for the time string on "today"
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);

    return targetTime < now;
};

export default function ReservationModal({ room, closeModal }: ModalProps) {
  const [supabase] = useState(() => createClient());
  const [loading, setLoading] = useState(false);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [studentProfile, setStudentProfile] = useState<Profile | null>(null);
  
  const [availableQuantities, setAvailableQuantities] = useState<Record<string, number>>({});
  const [equipmentSearch, setEquipmentSearch] = useState('');
  
  // Blocked Dates Map (Date String -> Reason)
  const [blockedDates, setBlockedDates] = useState<Record<string, string>>({});

  // Dropdown States
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const today = new Date();
  const maxDateObj = new Date();
  maxDateObj.setDate(today.getDate() + 5); // Limit to 5 days in advance
  
  // Use local time for date strings to strictly match input type="date"
  // Note: toISOString() uses UTC. For a simple PH app, we might need offset adjustment, 
  // but for now, we'll stick to standard ISO slicing or local construction if timezone matters.
  // Using simple split for now assuming server/client generally aligned or UTC.
  const minDate = today.toISOString().split('T')[0];
  const maxDate = maxDateObj.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    subject_code: '',
    professor_name: '',
    professor_email: '',
    professor_contact_number: '',
    date_reserved: '',
    selected_slots: [] as string[],
    equipment_needs: {} as Record<string, number>
  });

  // Generate Time Options: 7:30 AM (450m) to 9:00 PM (1260m)
  const timeOptions = useMemo(() => {
    const options = [];
    for (let i = 450; i <= 1260; i += 30) {
      const h = Math.floor(i / 60);
      const m = i % 60;
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      options.push({
        value: timeStr,
        label: formatTime(h, m),
        minutes: i
      });
    }
    return options;
  }, []);

  useEffect(() => {
    const initData = async () => {
      // 1. Fetch Equipment
      const { data: eqData } = await supabase.from('equipment').select('*').eq('status', 'active').order('name');
      if (eqData) {
        setEquipmentList(eqData as Equipment[]);
        const initialMap: Record<string, number> = {};
        eqData.forEach((eq: Equipment) => {
            initialMap[eq.id] = eq.total_quantity; 
        });
        setAvailableQuantities(initialMap);
      }

      // 2. Fetch User Profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setStudentProfile(data as Profile);
      }

      // 3. Fetch Blocked Dates (Ranges) and expand them
      const { data: bDates } = await supabase.from('blocked_dates').select('start_date, end_date, reason');
      if (bDates) {
         const map: Record<string, string> = {};
         bDates.forEach((b: { start_date: string; end_date: string; reason: string }) => {
             // Expand the range into individual dates for the map
             const rangeDays = getDaysArray(b.start_date, b.end_date);
             rangeDays.forEach(day => {
                 map[day] = b.reason;
             });
         });
         setBlockedDates(map);
      }
    };
    initData();
  }, [supabase]);

  // Fetch occupied slots when Date changes
  useEffect(() => {
    if (!formData.date_reserved) {
      setOccupiedSlots([]);
      setStartTime('');
      setEndTime('');
      return;
    }
    
    const fetchOccupied = async () => {
      const { data } = await supabase
        .from('reservations')
        .select('time_start, time_end')
        .eq('room_id', room.id)
        .eq('date_reserved', formData.date_reserved)
        .in('status', ['confirmed', 'verified', 'pending']); 

      if (data) {
        const busy = new Set<string>();
        data.forEach(res => {
          const startMins = toMinutes(res.time_start);
          const endMins = toMinutes(res.time_end);
          
          // Mark every 30min block start time as busy
          for (let m = startMins; m < endMins; m += 30) {
            const h = Math.floor(m / 60);
            const min = m % 60;
            busy.add(`${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
          }
        });
        setOccupiedSlots(Array.from(busy));
        // Reset time selection on date change to prevent invalid states
        setStartTime('');
        setEndTime('');
      }
    };
    fetchOccupied();
  }, [formData.date_reserved, room.id, supabase]);

  // Sync Start/End Time with selected_slots for Equipment Logic
  useEffect(() => {
    if (!startTime || !endTime) {
      setFormData(prev => ({ ...prev, selected_slots: [] }));
      return;
    }

    const startMins = toMinutes(startTime);
    const endMins = toMinutes(endTime);
    const slots: string[] = [];

    if (endMins > startMins) {
      for (let m = startMins; m < endMins; m += 30) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        slots.push(`${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
      }
    }
    setFormData(prev => ({ ...prev, selected_slots: slots }));
  }, [startTime, endTime]);

  // Calculate Equipment Availability based on Selected Slots
  useEffect(() => {
    if (formData.selected_slots.length === 0 || !formData.date_reserved) {
        const resetMap: Record<string, number> = {};
        equipmentList.forEach(eq => resetMap[eq.id] = eq.total_quantity);
        setAvailableQuantities(resetMap);
        return;
    }

    const checkEquipmentAvailability = async () => {
        const { data } = await supabase
            .from('reservations')
            .select(`id, reservation_equipment ( equipment_id, quantity_requested )`)
            .eq('date_reserved', formData.date_reserved)
            .neq('status', 'cancelled')
            .neq('status', 'rejected')
            .lt('time_start', endTime)
            .gt('time_end', startTime);

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
            const remaining = Math.max(0, eq.total_quantity - used);
            newAvailability[eq.id] = remaining;
        });

        setAvailableQuantities(newAvailability);
    };

    checkEquipmentAvailability();
  }, [formData.selected_slots, formData.date_reserved, startTime, endTime, equipmentList, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- FORM VALIDATION ---
    
    // 1. Contact Number Regex (PH format: 09XXXXXXXXX)
    const contactRegex = /^09\d{9}$/;
    if (!contactRegex.test(formData.professor_contact_number.replace(/\s/g, ''))) {
        return alert("Please enter a valid PH mobile number (e.g., 09123456789).");
    }

    if (!startTime || !endTime) return alert("Please select a valid time range.");
    if (!studentProfile) return alert("User profile not found.");

    // 2. Double check availability on submit
    const startMins = toMinutes(startTime);
    const endMins = toMinutes(endTime);
    for (let m = startMins; m < endMins; m += 30) {
       const h = Math.floor(m / 60);
       const min = m % 60;
       const checkTime = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
       if (occupiedSlots.includes(checkTime)) {
         return alert(`The slot starting at ${formatTime(h, min)} is occupied. Please adjust your time.`);
       }
    }

    for (const [eqId, qty] of Object.entries(formData.equipment_needs)) {
        if (qty > 0 && qty > (availableQuantities[eqId] || 0)) {
            const eqName = equipmentList.find(e => e.id === eqId)?.name;
            return alert(`Error: Only ${availableQuantities[eqId]} ${eqName}(s) are available for the selected time.`);
        }
    }

    setLoading(true);

    try {
      const { data: resData, error: resError } = await supabase
        .from('reservations')
        .insert({
          user_id: studentProfile.id,
          room_id: room.id,
          subject_code: formData.subject_code,
          professor_name: formData.professor_name,
          professor_email: formData.professor_email,
          professor_contact_number: formData.professor_contact_number,
          date_reserved: formData.date_reserved,
          time_start: startTime,
          time_end: endTime,
          status: 'pending',
          professor_status: 'pending'
        })
        .select()
        .single();

      if (resError) throw resError;

      const equipmentInserts = Object.entries(formData.equipment_needs)
        .filter(([, qty]) => qty > 0)
        .map(([eqId, qty]) => ({
          reservation_id: resData.id,
          equipment_id: eqId,
          quantity_requested: qty
        }));

      if (equipmentInserts.length > 0) {
        await supabase.from('reservation_equipment').insert(equipmentInserts);
      }

      // Notify Admins
      const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
      if (admins && admins.length > 0) {
        const adminNotifications = admins.map(admin => ({
          user_id: admin.id,
          title: 'New Reservation Request',
          message: `${studentProfile.full_name} requested Room ${room.room_number} for ${formData.subject_code}.`,
          type: 'info'
        }));
        await supabase.from('notifications').insert(adminNotifications);
      }

      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'professor_notify',
          to: formData.professor_email,
          name: studentProfile.full_name,
          reservationId: resData.id,
          details: {
            professor_name: formData.professor_name,
            room_number: room.room_number,
            date: formData.date_reserved,
            time_start: startTime,
            time_end: endTime,
            subject_code: formData.subject_code
          }
        })
      });

      alert('Reservation request submitted successfully!');
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
        <div className="p-6 border-b flex justify-between items-center bg-linear-to-r from-primary/5 to-white shrink-0">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="text-primary" size={24} />
              Reservation Request
            </h2>
            <p className="text-xs text-gray-500 mt-1">Room {room.room_number} • {room.type}</p>
          </div>
          <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="text-gray-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <form id="reservation-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm uppercase font-bold text-gray-500 border-b pb-2 flex items-center gap-2">
                <User size={16} /> Student Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Program</label>
                  <div className="text-gray-900 font-medium truncate">{studentProfile?.program || 'Loading...'}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Year & Section</label>
                  <div className="text-gray-900 font-medium truncate">{studentProfile?.year_section || 'Loading...'}</div>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Student Name</label>
                  <div className="text-gray-900 font-medium truncate">{studentProfile?.full_name || 'Loading...'}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm uppercase font-bold text-gray-500 border-b pb-2">Class Details</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                  <input required placeholder="e.g. CPE 401" className="input-field" onChange={e => setFormData({ ...formData, subject_code: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professor Name</label>
                  <input required placeholder="e.g. Engr. Juan Dela Cruz" className="input-field" onChange={e => setFormData({ ...formData, professor_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professor Contact #</label>
                  <input 
                    required 
                    placeholder="09123456789" 
                    className="input-field" 
                    onChange={e => setFormData({ ...formData, professor_contact_number: e.target.value })} 
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Must be 11 digits starting with 09</p>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professor Webmail</label>
                  <input required type="email" placeholder="professor@pup.edu.ph" className="input-field" onChange={e => setFormData({ ...formData, professor_email: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm uppercase font-bold text-gray-500 border-b pb-2 flex items-center gap-2">
                <Calendar size={16} /> Schedule Selection
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    required 
                    type="date" 
                    className="input-field" 
                    min={minDate}
                    max={maxDate} 
                    onChange={e => {
                        const selected = e.target.value;
                        if (blockedDates[selected]) {
                            alert(`Cannot reserve on this date.\nReason: ${blockedDates[selected]}`);
                            e.target.value = '';
                            setFormData({ ...formData, date_reserved: '' });
                        } else {
                            // Reset times when date changes to force re-validation
                            setStartTime('');
                            setEndTime('');
                            setFormData({ ...formData, date_reserved: selected });
                        }
                    }} 
                  />
                </div>

                {formData.date_reserved ? (
                  <>
                    <div>
                      <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                        <Clock size={14}/> Start Time
                      </label>
                      <select 
                        required 
                        className="input-field cursor-pointer"
                        value={startTime}
                        onChange={(e) => {
                          setStartTime(e.target.value);
                          setEndTime(''); // Reset end time on start change
                        }}
                      >
                        <option value="" disabled>Select start...</option>
                        {timeOptions
                          .filter(t => t.minutes < 1260) // Cannot start at 9:00 PM (closing)
                          .map((t) => {
                            const isTaken = occupiedSlots.includes(t.value);
                            
                            // Check if past
                            // We need to check if the selected date is today (in local timezone context)
                            const isToday = formData.date_reserved === new Date().toISOString().split('T')[0];
                            const isPast = isToday && isTimePast(t.value);

                            const isDisabled = isTaken || isPast;

                            return (
                              <option 
                                key={t.value} 
                                value={t.value} 
                                disabled={isDisabled} 
                                className={isDisabled ? 'text-gray-300 bg-gray-50' : ''}
                              >
                                {t.label} {isTaken ? '(Taken)' : ''} {isPast ? '(Past)' : ''}
                              </option>
                            )
                          })}
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                        <Clock size={14}/> End Time
                      </label>
                      <select 
                        required 
                        className="input-field cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        disabled={!startTime}
                      >
                        <option value="" disabled>Select end...</option>
                        {timeOptions
                          .filter(t => {
                            if (!startTime) return false;
                            const startMins = toMinutes(startTime);
                            // Must be after start
                            if (t.minutes <= startMins) return false;
                            
                            // Prevent selecting an end time that overlaps/crosses a booked slot
                            let blocked = false;
                            for (let m = startMins; m < t.minutes; m += 30) {
                               const h = Math.floor(m / 60);
                               const min = m % 60;
                               const str = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                               if (occupiedSlots.includes(str)) {
                                   blocked = true;
                                   break;
                               }
                            }
                            // Don't show options that force overlap
                            return !blocked;
                          })
                          .map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 flex items-center text-sm text-gray-400 italic bg-gray-50 px-4 rounded-lg border border-dashed border-gray-200">
                    <AlertCircle size={16} className="mr-2"/> Select a date to view available times
                  </div>
                )}
              </div>
              {startTime && endTime && (
                 <p className="text-xs text-primary font-medium text-right">
                    Selected Duration: {formatTime(Math.floor(toMinutes(startTime)/60), toMinutes(startTime)%60)} - {formatTime(Math.floor(toMinutes(endTime)/60), toMinutes(endTime)%60)}
                 </p>
              )}
            </div>

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
                          value={formData.equipment_needs[eq.id] || ''}
                          disabled={available === 0 && !formData.equipment_needs[eq.id]}
                          onChange={e => {
                              let val = parseInt(e.target.value);
                              if (isNaN(val) || val < 0) val = 0;
                              if (val > available) val = available;
                              
                              setFormData(prev => ({
                                ...prev,
                                equipment_needs: { 
                                  ...prev.equipment_needs, 
                                  [eq.id]: val 
                                }
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
              
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center text-gray-600">
                <span className="flex items-center justify-center gap-2">
                  Can&apos;t find your equipment here?
                  <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSe188dL4rBQt62VG8P8IfIXDQkHdanwXHElcwQWvAofereJoA/viewform?fbclid=IwY2xjawN5r6lleHRuA2FlbQIxMQBzcnRjBmFwcF9pZAEwAAEeJ8qPTnQfmpM5voV8hKQUy1u7V94pddKO8fXNnMLQElTpDoaBXqRuBJXk6DY_aem_2sk2gq37VbA81H376Xpp3g" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    Click this google forms <ExternalLink size={14} />
                  </a>
                </span>
              </div>
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white shrink-0 z-10 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
          <button 
            type="submit" 
            form="reservation-form" 
            disabled={loading} 
            className="btn btn-primary min-w-[140px] shadow-lg"
          >
            {loading ? 'Submitting...' : 'Confirm Request'}
          </button>
        </div>
      </div>
    </div>
  );
}