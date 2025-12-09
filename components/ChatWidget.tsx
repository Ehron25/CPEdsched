'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MessageCircle, X, Send, RefreshCw, ExternalLink } from 'lucide-react';
import { Room, Profile, Equipment } from '@/types';
import { User } from '@supabase/supabase-js';

type Step = 
  | 'init' | 'date' | 'filter_strategy' | 'filter_floor' | 'filter_feature' 
  | 'refine_amenities' | 'refine_floor' | 'room' | 'time_start' | 'time_end' 
  | 'subject' | 'prof_name' | 'prof_email' | 'prof_contact' 
  | 'equipment_ask' | 'equipment_select' | 'equipment_qty' | 'equipment_more' 
  | 'confirm' | 'success';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: { label: string; value: string }[];
  type?: 'text' | 'date' | 'room_list';
}

interface ReservationConflict {
  id: string;
  reservation_equipment: {
    equipment_id: string;
    quantity_requested: number;
  }[];
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const formatTime = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
};

// Business hours 7 AM - 9 PM
const GENERATE_SLOTS = () => {
  const slots = [];
  for (let h = 7; h < 21; h++) { 
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    slots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

const renderMessageText = (text: string) => {
  const urlRegex = /(https:\/\/docs\.google\.com\/forms\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all inline-flex items-center gap-1">
          Click this google forms <ExternalLink size={12} />
        </a>
      );
    }
    return part;
  });
};

export default function ChatWidget({ user }: { user: User | null }) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<Step>('init');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    date: '', roomId: '', roomName: '', timeStart: '', timeEnd: '',
    subject: '', profName: '', profEmail: '', profContact: '',
    equipmentNeeds: {} as Record<string, number> 
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]); 
  
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [tempEqId, setTempEqId] = useState<string>(''); 

  const today = new Date();
  const maxDateObj = new Date();
  maxDateObj.setDate(today.getDate() + 5);
  
  const minDate = today.toISOString().split('T')[0];
  const maxDate = maxDateObj.toISOString().split('T')[0];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (user && isOpen && !profile) {
      const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      };
      fetchProfile();
    }
  }, [user, isOpen, profile, supabase]);

  const addBotMessage = useCallback((text: string, options?: { label: string; value: string }[], type?: 'text' | 'date' | 'room_list') => {
    setMessages(prev => [...prev, { 
      id: Math.random().toString(36), 
      sender: 'bot', 
      text, 
      options,
      type 
    }]);
  }, []);

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Math.random().toString(36), sender: 'user', text }]);
  };

  const startConversation = useCallback(() => {
    setMessages([]);
    setFormData({
        date: '', roomId: '', roomName: '', timeStart: '', timeEnd: '',
        subject: '', profName: '', profEmail: '', profContact: '',
        equipmentNeeds: {}
    });
    setFilteredRooms([]); 
    
    // --- BUSINESS HOURS CHECK ---
    // const now = new Date(); // <--- Comment out
    // const h = now.getHours(); // <--- Comment out
    
    // Block if before 8:00 AM or after 5:00 PM (17:00)
    /* if (h < 8 || h >= 17) {
      addBotMessage("🔴 Reservations are currently closed.\n\nOur system accepts reservations between 8:00 AM and 5:00 PM.");
      setStep('init'); // Stop here
      return;
    }
    */
    // ----------------------------

    if (!user) {
      addBotMessage("Please log in to reserve a room.");
      return;
    }
    
    setStep('date');
    addBotMessage("Hello! I'm the CPE Scheduler Bot. 🤖");
    addBotMessage("I can help you reserve a room quickly. First, please select a date.", [], 'date');
  }, [user, addBotMessage]);

  const triggerConfirmation = useCallback((data: typeof formData) => {
    let eqSummary = "None";
    const eqKeys = Object.keys(data.equipmentNeeds);
    if (eqKeys.length > 0) {
        eqSummary = eqKeys.map(id => {
            const item = equipmentList.find(e => e.id === id);
            return item ? `${data.equipmentNeeds[id]}x ${item.name}` : '';
        }).join(', ');
    }

    const summary = `
📅 Date: ${data.date}
📍 Room: ${data.roomName}
⏰ Time: ${formatTime(data.timeStart)} - ${formatTime(data.timeEnd)} 
📚 Subject: ${data.subject}
👨‍🏫 Prof: ${data.profName} (${data.profContact})
📧 Email: ${data.profEmail}
📦 Equipment: ${eqSummary}
    `;
    
    setStep('confirm');
    addBotMessage("Here is your reservation summary:");
    addBotMessage(summary.trim());
    addBotMessage("Ready to submit?", [{ label: "Yes, Submit", value: "yes" }, { label: "Restart", value: "reset" }]);
  }, [equipmentList, addBotMessage]);

  const getUniqueFeatures = (roomList: Room[]) => {
    return Array.from(new Set(roomList.flatMap(r => r.features || []))).sort();
  };

  const getUniqueFloors = (roomList: Room[]) => {
    return Array.from(new Set(roomList.map(r => r.floor || 'Unknown'))).sort();
  };

  const showRoomSelection = useCallback((roomsToShow: Room[]) => {
    setStep('room');
    const roomOptions = roomsToShow.map(r => ({ 
        label: `${r.room_number} (${r.type}) - ${r.capacity} pax`, 
        value: r.id 
    }));
    
    if (roomOptions.length === 0) {
        addBotMessage("No rooms found matching your criteria. Would you like to try again?", [{ label: "Restart", value: "reset" }]);
    } else {
        addBotMessage(`Found ${roomOptions.length} room(s). Please select one:`, roomOptions, 'room_list');
    }
  }, [addBotMessage]);

  const processStep = useCallback(async (value: string) => {
    setLoading(true);

    if (value === 'reset') {
        startConversation();
        setLoading(false);
        return;
    }

    switch (step) {
      case 'date':
        // CHECK IF BLOCKED (Updated for Ranges)
        const { data: bDate } = await supabase
            .from('blocked_dates')
            .select('reason')
            .lte('start_date', value)
            .gte('end_date', value)
            .limit(1)
            .maybeSingle();

        if (bDate) {
            addBotMessage(`⚠️ Cannot book on ${value}.\nReason: ${bDate.reason}. Please select another date.`, [], 'date');
            setLoading(false);
            return;
        }

        setFormData(prev => ({ ...prev, date: value }));
        const { data: roomData } = await supabase.from('rooms').select('*').eq('status', 'available').order('room_number');
        const availableRooms = roomData as Room[] || [];
        setRooms(availableRooms);
        setStep('filter_strategy');
        addBotMessage(`I found ${availableRooms.length} available rooms. How would you like to filter them?`, [
            { label: "By Floor", value: "floor" },
            { label: "By Amenities", value: "amenities" },
            { label: "Show All", value: "all" }
        ]);
        break;

      case 'filter_strategy':
        if (value === 'floor') {
            setStep('filter_floor');
            const floors = getUniqueFloors(rooms);
            addBotMessage("Select a floor:", floors.map(f => ({ label: `${f} Floor`, value: f })));
        } else if (value === 'amenities') {
            setStep('filter_feature');
            const features = getUniqueFeatures(rooms);
            if (features.length === 0) {
                addBotMessage("No specific features listed. Showing all rooms.");
                showRoomSelection(rooms);
            } else {
                addBotMessage("Select a required feature:", features.map(f => ({ label: f, value: f })));
            }
        } else {
            showRoomSelection(rooms);
        }
        break;

      case 'filter_floor': {
        const currentFiltered = rooms.filter(r => (r.floor || 'Unknown') === value);
        setFilteredRooms(currentFiltered); 
        const features = getUniqueFeatures(currentFiltered);
        if (features.length > 0) {
            setStep('refine_amenities');
            addBotMessage(`Found ${currentFiltered.length} rooms on ${value} Floor. Filter by amenity?`, [
                ...features.map(f => ({ label: f, value: f })),
                { label: "Show All Results", value: "show_all" }
            ]);
        } else {
            showRoomSelection(currentFiltered);
        }
        break;
      }

      case 'filter_feature': {
        const currentFiltered = rooms.filter(r => r.features && r.features.includes(value));
        setFilteredRooms(currentFiltered); 
        const floors = getUniqueFloors(currentFiltered);
        if (floors.length > 1) { 
            setStep('refine_floor');
            addBotMessage(`Found ${currentFiltered.length} rooms with ${value}. Filter by floor?`, [
                ...floors.map(f => ({ label: `${f} Floor`, value: f })),
                { label: "Show All Results", value: "show_all" }
            ]);
        } else {
            showRoomSelection(currentFiltered);
        }
        break;
      }

      case 'refine_amenities': {
        let finalRooms = filteredRooms;
        if (value !== 'show_all') {
            finalRooms = filteredRooms.filter(r => r.features && r.features.includes(value));
        }
        showRoomSelection(finalRooms);
        break;
      }

      case 'refine_floor': {
        let finalRooms = filteredRooms;
        if (value !== 'show_all') {
            finalRooms = filteredRooms.filter(r => (r.floor || 'Unknown') === value);
        }
        showRoomSelection(finalRooms);
        break;
      }

      case 'room': {
        const selectedRoom = rooms.find(r => r.id === value);
        if (!selectedRoom) {
            addBotMessage("Invalid room. Please select from the dropdown.");
            setLoading(false);
            return;
        }
        setFormData(prev => ({ ...prev, roomId: value, roomName: selectedRoom.room_number }));
        
        const { data: resData } = await supabase
            .from('reservations')
            .select('time_start, time_end')
            .eq('room_id', value)
            .eq('date_reserved', formData.date)
            .in('status', ['confirmed', 'verified', 'pending']);
        
        const busy = new Set<string>();
        resData?.forEach(r => {
            const start = toMinutes(r.time_start);
            const end = toMinutes(r.time_end);
            for(let m = start; m < end; m+=30) {
                const h = Math.floor(m/60);
                const min = m%60;
                busy.add(`${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
            }
        });
        setOccupiedSlots(Array.from(busy));

        setStep('time_start');
        const slots = GENERATE_SLOTS().filter(s => !busy.has(s));
        
        if (slots.length === 0) {
             addBotMessage("This room is fully booked for the selected date. Please try another room or date.", [{ label: "Restart", value: "reset" }]);
        } else {
             addBotMessage("Select a START time:", slots.map(s => ({ label: formatTime(s), value: s })));
        }
        break;
      }

      case 'time_start': {
        setFormData(prev => ({ ...prev, timeStart: value }));
        setStep('time_end');
        
        const startMin = toMinutes(value);
        const consecutiveSlots: string[] = [];
        
        for (let m = startMin + 30; m <= startMin + 180; m += 30) {
            if (m > 21 * 60) break; // 9 PM limit

            const h = Math.floor(m / 60);
            const min = m % 60;
            const timeStr = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
            
            const prevBlockH = Math.floor((m-30)/60);
            const prevBlockM = (m-30)%60;
            const prevBlockStr = `${prevBlockH.toString().padStart(2, '0')}:${prevBlockM.toString().padStart(2, '0')}`;
            
            if (occupiedSlots.includes(prevBlockStr)) break;
            
            consecutiveSlots.push(timeStr);
        }

        if (consecutiveSlots.length === 0) {
             addBotMessage("No available end times for this start slot. Please try another time.", [{ label: "Restart", value: "reset" }]);
             setStep('init');
        } else {
             addBotMessage(`Start: ${formatTime(value)}. Select END time:`, consecutiveSlots.map(s => ({ label: formatTime(s), value: s })));
        }
        break;
      }

      case 'time_end':
        setFormData(prev => ({ ...prev, timeEnd: value }));
        setStep('subject');
        addBotMessage("Please enter the Subject Code (e.g., CPE 401):");
        break;

      case 'subject':
        setFormData(prev => ({ ...prev, subject: value }));
        setStep('prof_name');
        addBotMessage("What is the Professor's Name?");
        break;

      case 'prof_name':
        setFormData(prev => ({ ...prev, profName: value }));
        setStep('prof_email');
        addBotMessage("What is the Professor's Email? (@pup.edu.ph or preferred email)");
        break;

      case 'prof_email':
        if (!value.includes('@')) {
            addBotMessage("⚠️ That doesn't look like a valid email. Please try again.");
            setLoading(false);
            return;
        }
        setFormData(prev => ({ ...prev, profEmail: value }));
        setStep('prof_contact');
        addBotMessage("What is the Professor's Contact Number?");
        break;

      case 'prof_contact':
        setFormData(prev => ({ ...prev, profContact: value }));
        setStep('equipment_ask');
        addBotMessage("Do you need to borrow any equipment?", [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }]);
        break;

      case 'equipment_ask':
        if (value === 'no') {
            triggerConfirmation(formData);
        } else {
            const { data: allEq } = await supabase.from('equipment').select('*').eq('status', 'active').order('name');
            let eqList = allEq as Equipment[] || [];

            const { data } = await supabase
                .from('reservations')
                .select(`id, reservation_equipment ( equipment_id, quantity_requested )`)
                .eq('date_reserved', formData.date)
                .neq('status', 'cancelled')
                .neq('status', 'rejected')
                .lt('time_start', formData.timeEnd)
                .gt('time_end', formData.timeStart);

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

            eqList = eqList.map(eq => ({
                ...eq,
                available_quantity: Math.max(0, eq.total_quantity - (usedMap[eq.id] || 0))
            })).filter(eq => eq.available_quantity > 0);
            
            setEquipmentList(eqList);

            if (eqList.length === 0) {
                addBotMessage("Sorry, no equipment is available for your selected time.");
                addBotMessage("Can't find your equipment here? https://docs.google.com/forms/d/e/1FAIpQLSe188dL4rBQt62VG8P8IfIXDQkHdanwXHElcwQWvAofereJoA/viewform?fbclid=IwY2xjawN5r6lleHRuA2FlbQIxMQBzcnRjBmFwcF9pZAEwAAEeJ8qPTnQfmpM5voV8hKQUy1u7V94pddKO8fXNnMLQElTpDoaBXqRuBJXk6DY_aem_2sk2gq37VbA81H376Xpp3g Click this google forms");
                triggerConfirmation(formData);
            } else {
                setStep('equipment_select');
                addBotMessage("Select an item to borrow:", eqList.map(e => ({ label: `${e.name} (${e.available_quantity})`, value: e.id })));
                addBotMessage("Can't find your equipment here? https://docs.google.com/forms/d/e/1FAIpQLSe188dL4rBQt62VG8P8IfIXDQkHdanwXHElcwQWvAofereJoA/viewform?fbclid=IwY2xjawN5r6lleHRuA2FlbQIxMQBzcnRjBmFwcF9pZAEwAAEeJ8qPTnQfmpM5voV8hKQUy1u7V94pddKO8fXNnMLQElTpDoaBXqRuBJXk6DY_aem_2sk2gq37VbA81H376Xpp3g Click this google forms");
            }
        }
        break;

      case 'equipment_select': {
        const selectedEq = equipmentList.find(e => e.id === value);
        if (selectedEq) {
            setTempEqId(value);
            setStep('equipment_qty');
            addBotMessage(`How many ${selectedEq.name} do you need? (Max: ${selectedEq.available_quantity})`);
        } else {
            addBotMessage("Invalid selection. Please choose from the buttons.");
        }
        break;
      }

      case 'equipment_qty': {
        const qty = parseInt(value);
        const eqItem = equipmentList.find(e => e.id === tempEqId);
        if (isNaN(qty) || qty <= 0 || (eqItem && qty > eqItem.available_quantity)) {
            addBotMessage(`Invalid quantity. Please enter a number between 1 and ${eqItem?.available_quantity}.`);
            setLoading(false);
            return;
        }
        setFormData(prev => ({
            ...prev,
            equipmentNeeds: { ...prev.equipmentNeeds, [tempEqId]: qty }
        }));
        setStep('equipment_more');
        addBotMessage(`Added ${qty} x ${eqItem?.name}. Do you need anything else?`, [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }]);
        break;
      }

      case 'equipment_more':
        if (value === 'yes') {
            setStep('equipment_select');
            addBotMessage("Select another item:", equipmentList.map(e => ({ label: `${e.name} (${e.available_quantity})`, value: e.id })));
        } else {
            triggerConfirmation(formData);
        }
        break;

      case 'confirm': {
        if (value.toLowerCase() === 'reset') {
            startConversation();
            setLoading(false);
            return;
        }
        const { data: resData, error } = await supabase.from('reservations').insert({
            user_id: user?.id,
            room_id: formData.roomId,
            date_reserved: formData.date,
            time_start: formData.timeStart,
            time_end: formData.timeEnd,
            subject_code: formData.subject,
            professor_name: formData.profName,
            professor_email: formData.profEmail,
            professor_contact_number: formData.profContact,
            status: 'pending',
            professor_status: 'pending'
        }).select().single();

        if (error) {
            addBotMessage(`Error: ${error.message}. Please try again.`);
            setStep('init');
        } else if (resData) {
            const eqInserts = Object.entries(formData.equipmentNeeds).map(([eqId, qty]) => ({
                reservation_id: resData.id,
                equipment_id: eqId,
                quantity_requested: qty
            }));
            if (eqInserts.length > 0) {
                await supabase.from('reservation_equipment').insert(eqInserts);
            }
            setStep('success');
            addBotMessage("✅ Reservation request submitted successfully! You can track it in your dashboard.");
            fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'professor_notify',
                  to: formData.profEmail,
                  name: profile?.full_name || 'Student',
                  details: {
                    professor_name: formData.profName,
                    room_number: formData.roomName,
                    date: formData.date,
                    time_start: formData.timeStart,
                    time_end: formData.timeEnd,
                    subject_code: formData.subject
                  }
                })
            });
        }
        break;
      }
        
      case 'success':
          startConversation();
          break;
    }
    setLoading(false);
  }, [step, formData, occupiedSlots, rooms, filteredRooms, user, profile, supabase, equipmentList, tempEqId, startConversation, addBotMessage, triggerConfirmation, showRoomSelection]);

  const handleInputSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const value = input.trim();
    addUserMessage(value);
    setInput('');
    processStep(value);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      startConversation();
    }
  };

  if (!user) return null; 

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary-hover text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
        >
          <MessageCircle size={24} />
          <span className="font-bold hidden md:inline">Reserve Room</span>
        </button>
      )}

      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-40 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col transition-all duration-300 overflow-hidden ${minimized ? 'w-72 h-14' : 'w-[90vw] md:w-96 h-[600px] max-h-[80vh]'}`}>
          <div className="bg-primary p-4 flex justify-between items-center text-white shrink-0 cursor-pointer" onClick={() => setMinimized(!minimized)}>
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg"><MessageCircle size={18} /></div>
                <div>
                    <h3 className="font-bold text-sm">Quick Reserve</h3>
                    {!minimized && <p className="text-[10px] opacity-80">CPE Automated Assistant</p>}
                </div>
            </div>
            <div className="flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); startConversation(); }} className="p-1.5 hover:bg-white/20 rounded-md" title="Reset"><RefreshCw size={16}/></button>
                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1.5 hover:bg-white/20 rounded-md"><X size={16}/></button>
            </div>
          </div>

          {!minimized && (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-line leading-relaxed">{renderMessageText(msg.text)}</p>
                      
                      {msg.type === 'date' && msg.sender === 'bot' && (
                         <div className="mt-3">
                            <input 
                                type="date" 
                                className="w-full p-2 border rounded bg-gray-50 text-gray-800 text-xs" 
                                min={minDate}
                                max={maxDate} 
                                onChange={(e) => {
                                    if(e.target.value) {
                                        addUserMessage(e.target.value);
                                        processStep(e.target.value);
                                    }
                                }}
                            />
                         </div>
                      )}

                      {/* Dropdown for Rooms */}
                      {msg.type === 'room_list' && msg.options && (
                        <select
                            className="w-full mt-3 p-2 bg-white border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                            onChange={(e) => {
                                if(e.target.value) {
                                    const label = e.target.options[e.target.selectedIndex].text;
                                    addUserMessage(label);
                                    processStep(e.target.value);
                                }
                            }}
                            defaultValue=""
                        >
                            <option value="" disabled>-- Select a Room --</option>
                            {msg.options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                      )}

                      {/* Regular Buttons for other options (Features, Floors, Times) */}
                      {msg.options && msg.type !== 'room_list' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.options.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => {
                                addUserMessage(opt.label);
                                processStep(opt.value);
                              }}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 rounded-full text-xs font-medium transition-colors text-left"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3 flex gap-1 items-center">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75" />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
                        </div>
                    </div>
                )}
              </div>

              <form onSubmit={handleInputSubmit} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={step === 'date' ? "Select a date above..." : step === 'room' ? "Select a room above..." : "Type here..."}
                  className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  disabled={loading || ['success', 'date', 'room', 'filter_strategy', 'filter_floor', 'filter_feature', 'refine_amenities', 'refine_floor', 'time_start', 'time_end', 'equipment_ask', 'equipment_select', 'equipment_more'].includes(step)}
                />
                <button 
                    type="submit" 
                    disabled={!input.trim() || loading}
                    className="p-2 bg-primary text-white rounded-xl disabled:opacity-50 hover:bg-primary-hover transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}