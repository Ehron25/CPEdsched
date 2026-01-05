'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import AdminRequestModal from "@/components/AdminRequestModal";
import AdminRoomModal from "@/components/AdminRoomModal";
import AdminKeyModal from "@/components/AdminKeyModal";
import AdminAnalytics from "@/components/AdminAnalytics";
import AdminEquipmentModal from '@/components/AdminEquipmentModal';
import AdminBlockDateModal from "@/components/AdminBlockDateModal";
import {
  Key, Clock, Users, ExternalLink, RotateCcw, X, DoorOpen, Plus,
  Pencil, BarChart3, Filter, LucideIcon, Trash2,
  ChevronLeft, ChevronRight, Box, CheckCircle2, Layers, Search,
  RefreshCw, AlertTriangle, CalendarOff, XCircle, ScrollText, ChevronDown
} from 'lucide-react';
import { ReservationWithDetails, Profile, Room, RoomKey, Equipment, IncidentReport, BlockedDate, AuditLog } from '@/types';

const SearchInput = ({
  placeholder,
  value,
  onChange
}: {
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
}) => (
  <div className="relative w-full md:w-64">
    <input
      type="text"
      placeholder={placeholder}
      className="input-field pl-9 text-sm py-1.5"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <Search className="absolute left-3 top-2 text-gray-400" size={16} />
  </div>
);

// 1. Define a type for the dynamic details to satisfy the linter
type LogDetails = {
  description?: string;
  professor_name?: string;
  subject?: string;
  reason?: string;
  reservation_number?: string;
  room?: string;
  student?: string;
  completed?: boolean;
  [key: string]: unknown; // Allow other properties
};

// 2. Updated helper function
const renderLogDetails = (rawDetails: unknown) => {
  if (!rawDetails || typeof rawDetails !== 'object') return '-';
  
  // Cast to our flexible type
  const details = rawDetails as LogDetails;

  // 1. Reset Semester / Custom Descriptions
  if (details.description) return details.description;

  // 2. Professor Actions (Email Links)
  if (details.professor_name) {
    let text = `Prof. ${details.professor_name} - ${details.subject || 'Unknown Subject'}`;
    if (details.reason) text += ` (Reason: ${details.reason})`;
    return text;
  }

  // 3. Admin Actions (Approve/Decline)
  if (details.reservation_number) {
    return `Ref: ${details.reservation_number} | ${details.subject} | Room ${details.room}`;
  }
  // If declined without a reservation number (just subject/reason)
  if (details.subject && details.reason) {
     return `Subject: ${details.subject} | Reason: ${details.reason}`;
  }

  // 4. Key Actions
  if (details.student && details.room) {
    return `Issued to: ${details.student} | Room: ${details.room}`;
  }
  if (details.room && details.completed) {
     return `Room ${details.room} key returned & reservation completed.`;
  }
  
  // 5. Fallback: Generic Key-Value pair
  return Object.entries(details)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
    .join(' | ');
};

export default function AdminDashboard() {
  // Merged 'reports' and 'logs' into 'activity'
  const [activeTab, setActiveTab] = useState<'reservations' | 'resources' | 'students' | 'activity' | 'analytics'>('reservations');
  
  // Sub-view state for Activity tab
  const [activityView, setActivityView] = useState<'logs' | 'issues'>('logs');

  const [resourceView, setResourceView] = useState<'rooms' | 'inventory' | 'keys' | 'dates'>('rooms');
  const [reservationFilter, setReservationFilter] = useState<'all' | 'pending' | 'verified' | 'cancelled' | 'history'>('pending');
  
  // Log Filter States
  const [logFilter, setLogFilter] = useState<string>('all');
  const [showLogFilterDropdown, setShowLogFilterDropdown] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null); // For clicking outside to close
  
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Data States
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomKeys, setRoomKeys] = useState<RoomKey[]>([]);
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  // Modals
  const [selectedRes, setSelectedRes] = useState<ReservationWithDetails | null>(null);
  const [viewingCOR, setViewingCOR] = useState<string | null>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<RoomKey | null>(null);
  const [showEqModal, setShowEqModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);

  // Click outside listener for Dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowLogFilterDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterRef]);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      if (activeTab === 'students') {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student')
          .order('created_at', { ascending: false });
        if (!error && data) setStudents(data as Profile[]);

      } else if (activeTab === 'resources') {
        const { data: roomData } = await supabase.from('rooms').select('*').order('room_number', { ascending: true });
        if (roomData) setRooms(roomData as Room[]);

        const { data: eqData } = await supabase.from('equipment').select('*').order('name');
        if (eqData) setInventory(eqData as Equipment[]);

        const { data: keyData } = await supabase.from('room_keys').select('*').order('key_number');
        if (keyData) setRoomKeys(keyData as RoomKey[]);

        const { data: dateData } = await supabase.from('blocked_dates').select('*').order('start_date', { ascending: true });
        if (dateData) setBlockedDates(dateData as BlockedDate[]);

      } else if (activeTab === 'activity') {
        // Fetch Reports
        const { data: reportData } = await supabase
          .from('incident_reports')
          .select(`*, reporter:profiles(full_name, email), room:rooms(room_number), equipment:equipment(name)`)
          .order('created_at', { ascending: false });
        if (reportData) setReports(reportData as unknown as IncidentReport[]);

        // Fetch Logs
        const { data: logData } = await supabase
          .from('audit_logs')
          .select(`*, admin:profiles(full_name, email)`)
          .order('created_at', { ascending: false });
        
        if (logData) setAuditLogs(logData as AuditLog[]);

      } else {
        // Reservations (Default)
        const query = supabase
          .from('reservations')
          .select(`*, profile:profiles!reservations_user_id_fkey(*), room:rooms(*), equipment:reservation_equipment(quantity_requested, equipment:equipment(name)), key_issuance(id, status)`)
          .order('created_at', { ascending: false });

        const { data, error } = await query;
        if (!error && data) {
          setReservations(data as unknown as ReservationWithDetails[]);
        }

        if (activeTab === 'analytics') {
          const { data: roomData } = await supabase.from('rooms').select('*');
          if (roomData) setRooms(roomData as Room[]);
        }

        if (activeTab === 'reservations') {
          const { data: keyData } = await supabase.from('room_keys').select('*');
          if (keyData) setRoomKeys(keyData as RoomKey[]);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [activeTab, supabase]);

  useEffect(() => {
    loadData();

    // Realtime subscriptions
    const channel = supabase
      .channel('admin-dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
        if (activeTab === 'reservations' || activeTab === 'analytics') loadData(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => {
        if (activeTab === 'activity') loadData(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incident_reports' }, () => {
        if (activeTab === 'activity') loadData(true);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, activeTab, loadData]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
  };

  const handleActivityViewChange = (view: typeof activityView) => {
    setActivityView(view);
    setCurrentPage(1);
    setSearchQuery('');
    setLogFilter('all');
  }

  const handleResourceViewChange = (view: typeof resourceView) => {
    setResourceView(view);
    setCurrentPage(1);
    setSearchQuery('');
  }

  const handleFilterChange = (filter: typeof reservationFilter) => {
    setReservationFilter(filter);
    setCurrentPage(1);
  };

  const resolveReport = async (id: string) => {
    if (!confirm("Mark this report as resolved?")) return;
    await supabase.from('incident_reports').update({ status: 'resolved' }).eq('id', id);
    loadData(true);
  };

  const handleVerifyStudent = async (studentId: string, currentStatus: boolean) => {
    if (!confirm(currentStatus ? "Revoke verification?" : "Verify this student?")) return;
    const { error } = await supabase.from('profiles').update({ is_verified: !currentStatus }).eq('id', studentId);
    if (error) {
      alert("Failed to update status");
      return;
    }
    if (!currentStatus) {
      const student = students.find(s => s.id === studentId);
      if (student && student.email) {
        try {
          await fetch('/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'account_verified',
              to: student.email,
              name: student.full_name
            })
          });
        } catch (e) {
          console.error("Failed to send verification email", e);
        }
      }
    }
    loadData(true);
  };

  const handleResetSemester = async () => {
    const confirmed = confirm(
      "⚠️ GLOBAL RESET WARNING ⚠️\n\n" +
      "This action will:\n" +
      "1. Unverify ALL student accounts.\n" +
      "2. Email all students to upload a new COR.\n\n" +
      "Are you sure you want to start a new semester?"
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reset-students', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert("Success! All students have been unverified and notified.");
        loadData(true);
      } else {
        throw new Error(data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert("Failed to reset semester: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this key?")) return;
    const { error } = await supabase.from('room_keys').delete().eq('id', id);
    if (error) alert("Failed to delete key. It might be currently issued.");
    else loadData(true);
  };

  const handleUnblockDate = async (id: string) => {
    if (!confirm("Unblock this date? Students will be able to book it.")) return;
    const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
    if (error) alert("Failed to unblock date");
    else loadData(true);
  };

  const handleRoomModal = (room: Room | null = null) => {
    setSelectedRoom(room);
    setShowRoomModal(true);
  };

  const handleKeyModal = (key: RoomKey | null = null) => {
    setSelectedKey(key);
    setShowKeyModal(true);
  };

  const handleRefresh = () => loadData();

  // --- Filtering Logic ---
  const getFilteredData = () => {
    let filtered = reservations;
    if (activeTab === 'reservations') {
      if (reservationFilter === 'pending') filtered = filtered.filter(r => r.status === 'pending');
      else if (reservationFilter === 'verified') filtered = filtered.filter(r => r.status === 'verified' || r.status === 'confirmed');
      else if (reservationFilter === 'cancelled') filtered = filtered.filter(r => ['cancelled', 'rejected'].includes(r.status));
      else if (reservationFilter === 'history') filtered = filtered.filter(r => ['completed', 'rejected'].includes(r.status));

      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(r =>
          (r.reservation_number && r.reservation_number.toLowerCase().includes(lowerQuery)) ||
          (r.profile?.full_name && r.profile.full_name.toLowerCase().includes(lowerQuery)) ||
          (r.subject_code && r.subject_code.toLowerCase().includes(lowerQuery)) ||
          (r.professor_name && r.professor_name.toLowerCase().includes(lowerQuery)) ||
          (r.room?.room_number && r.room.room_number.toLowerCase().includes(lowerQuery))
        );
      }
    }
    return filtered;
  };

  // --- FILTER LOGS ---
  const filteredLogs = auditLogs.filter(log => {
    // 1. Text Search
    const matchesSearch = !searchQuery || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.admin?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Dropdown Filter
    const matchesFilter = logFilter === 'all' || log.action === logFilter;

    return matchesSearch && matchesFilter;
  });

  const filteredReports = reports.filter(rep => 
    !searchQuery ||
    rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rep.reporter?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (rep.room?.room_number && rep.room.room_number.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredStudents = students.filter(s =>
    !searchQuery ||
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRooms = rooms.filter(r =>
    !searchQuery ||
    r.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInventory = inventory.filter(eq =>
    !searchQuery ||
    eq.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredKeys = roomKeys.filter(k => {
    const assignedRoom = rooms.find(r => r.id === k.room_id);
    return !searchQuery ||
      k.key_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (assignedRoom && assignedRoom.room_number.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const displayedReservations = getFilteredData();

  const getCurrentDataLength = () => {
    if (activeTab === 'students') return filteredStudents.length;
    if (activeTab === 'resources') {
      if (resourceView === 'rooms') return filteredRooms.length;
      if (resourceView === 'inventory') return filteredInventory.length;
      if (resourceView === 'keys') return filteredKeys.length;
      if (resourceView === 'dates') return blockedDates.length;
    }
    if (activeTab === 'activity') {
      return activityView === 'logs' ? filteredLogs.length : filteredReports.length;
    }
    return displayedReservations.length;
  };

  const totalItems = getCurrentDataLength();
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const renderMobileNavItem = (id: typeof activeTab, Icon: LucideIcon, label: string) => (
    <button
      onClick={() => handleTabChange(id)}
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors duration-200 ${activeTab === id ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
        }`}
    >
      <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} className="mb-0.5" />
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  );

  const LOG_ACTIONS = [
    'Reservation Approved',
    'Reservation Declined',
    'Key Issued',
    'Key Returned',
    'Reset Students',
    'Professor Confirmed', 
    'Professor Declined'
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 md:mb-8">
        <div className="flex justify-between items-center w-full lg:w-auto">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'analytics' ? 'System Overview' : 'Manage reservations & resources'}
            </p>
          </div>
          <div className="lg:hidden flex gap-2">
            {/* Mobile Actions */}
            {activeTab === 'resources' && resourceView === 'rooms' && <button onClick={() => { setSelectedRoom(null); setShowRoomModal(true); }} className="p-2 bg-primary text-white rounded-lg"><Plus size={20} /></button>}
            {activeTab === 'resources' && resourceView === 'keys' && <button onClick={() => { setSelectedKey(null); setShowKeyModal(true); }} className="p-2 bg-primary text-white rounded-lg"><Plus size={20} /></button>}
            {activeTab === 'resources' && resourceView === 'inventory' && <button onClick={() => { setSelectedEquipment(null); setShowEqModal(true); }} className="p-2 bg-primary text-white rounded-lg"><Plus size={20} /></button>}
            {activeTab === 'resources' && resourceView === 'dates' && <button onClick={() => setShowDateModal(true)} className="p-2 bg-primary text-white rounded-lg"><Plus size={20} /></button>}

            {activeTab === 'students' && (
              <button
                onClick={handleResetSemester}
                className="p-2 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition-colors shadow-sm"
                title="Reset Semester"
              >
                <RefreshCw size={20} />
              </button>
            )}

            <button onClick={() => loadData()} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:text-primary transition-all shadow-sm">
              <RotateCcw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm overflow-x-auto max-w-[650px]">
            {(['reservations', 'resources', 'students', 'activity', 'analytics'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`tab-btn capitalize flex items-center gap-2 px-3 py-1.5 whitespace-nowrap ${activeTab === tab ? 'active-tab' : ''}`}
              >
                {tab === 'reservations' && <Clock size={16} />}
                {tab === 'resources' && <Layers size={16} />}
                {tab === 'students' && <Users size={16} />}
                {tab === 'activity' && <ScrollText size={16} />}
                {tab === 'analytics' && <BarChart3 size={16} />}
                {tab}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          {activeTab === 'resources' && resourceView === 'rooms' && <button onClick={() => { setSelectedRoom(null); setShowRoomModal(true); }} className="btn btn-primary shadow-sm px-3 text-sm"><Plus size={16} /> Add Room</button>}
          {activeTab === 'resources' && resourceView === 'keys' && <button onClick={() => { setSelectedKey(null); setShowKeyModal(true); }} className="btn btn-primary shadow-sm px-3 text-sm"><Plus size={16} /> Add Key</button>}
          {activeTab === 'resources' && resourceView === 'inventory' && <button onClick={() => { setSelectedEquipment(null); setShowEqModal(true); }} className="btn btn-primary shadow-sm px-3 text-sm"><Plus size={16} /> Add Category</button>}
          {activeTab === 'resources' && resourceView === 'dates' && <button onClick={() => setShowDateModal(true)} className="btn btn-primary shadow-sm px-3 text-sm"><Plus size={16} /> Block Date</button>}

          {activeTab === 'students' && (
            <button
              onClick={handleResetSemester}
              className="btn bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 shadow-sm px-3 text-sm flex items-center gap-2"
            >
              <RefreshCw size={16} /> New Semester
            </button>
          )}

          <button onClick={() => loadData()} className="p-2 bg-white border border-gray-200 rounded-lg hover:text-primary transition-all shadow-sm">
            <RotateCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-20 lg:mb-0 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px] min-h-[200px]">
            <div className="text-primary font-medium flex items-center gap-2"><RotateCcw size={16} className="animate-spin" /> Refreshing...</div>
          </div>
        )}

        {/* --- ANALYTICS --- */}
        {activeTab === 'analytics' && (
          <div className="p-6">
            <AdminAnalytics reservations={reservations} rooms={rooms} />
          </div>
        )}

        {/* --- RESOURCES TAB --- */}
        {activeTab === 'resources' && (
          <div className="w-full">
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
                <button onClick={() => handleResourceViewChange('rooms')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${resourceView === 'rooms' ? 'bg-white text-primary shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                  <DoorOpen size={16} /> <span className="hidden sm:inline">Rooms</span>
                </button>
                <button onClick={() => handleResourceViewChange('inventory')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${resourceView === 'inventory' ? 'bg-white text-primary shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Box size={16} /> <span className="hidden sm:inline">Equipment</span>
                </button>
                <button onClick={() => handleResourceViewChange('keys')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${resourceView === 'keys' ? 'bg-white text-primary shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Key size={16} /> <span className="hidden sm:inline">Keys</span>
                </button>
                <button onClick={() => handleResourceViewChange('dates')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${resourceView === 'dates' ? 'bg-white text-primary shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                  <CalendarOff size={16} /> <span className="hidden sm:inline">Blocked Dates</span>
                </button>
              </div>
              {resourceView !== 'dates' && (
                <SearchInput
                  placeholder={`Search ${resourceView}...`}
                  value={searchQuery}
                  onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
                />
              )}
            </div>

            <div className="p-0">
               {resourceView === 'rooms' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs md:text-sm uppercase whitespace-nowrap">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Room #</th>
                        <th className="px-6 py-4 font-semibold">Type</th>
                        <th className="px-6 py-4 font-semibold">Floor</th>
                        <th className="px-6 py-4 font-semibold">Capacity</th>
                        <th className="px-6 py-4 font-semibold">Features</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredRooms.slice(startIndex, endIndex).map((room) => (
                        <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900 text-lg">{room.room_number}</td>
                          <td className="px-6 py-4 text-gray-600">{room.type}</td>
                          <td className="px-6 py-4 text-gray-600">{room.floor || 'N/A'}</td>
                          <td className="px-6 py-4 text-gray-600">{room.capacity}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {room.features && room.features.length > 0 ? (
                                room.features.map((f, i) => (
                                  <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                                    {f}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs italic">None</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`status-badge ${room.status === 'available' ? 'bg-green-100 text-green-700' :
                              room.status === 'maintenance' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                              {room.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleRoomModal(room)} className="text-primary hover:text-primary-hover font-medium flex items-center justify-end gap-1">
                              <Pencil size={14} /> Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredRooms.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">No rooms found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
               {resourceView === 'inventory' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs md:text-sm uppercase whitespace-nowrap">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Equipment Name</th>
                        <th className="px-6 py-4 font-semibold">Total Qty</th>
                        <th className="px-6 py-4 font-semibold">Available</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredInventory.slice(startIndex, endIndex).map(eq => (
                        <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900">{eq.name}</td>
                          <td className="px-6 py-4 text-gray-600">{eq.total_quantity}</td>
                          <td className="px-6 py-4 font-medium text-green-600">{eq.available_quantity}</td>
                          <td className="px-6 py-4">
                            <span className={`status-badge ${eq.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{eq.status}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => { setSelectedEquipment(eq); setShowEqModal(true); }} className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-end gap-1">
                              <Pencil size={14} /> Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredInventory.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">No equipment found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
               {resourceView === 'keys' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs md:text-sm uppercase whitespace-nowrap">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Key Label</th>
                        <th className="px-6 py-4 font-semibold">Assigned Room</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredKeys.slice(startIndex, endIndex).map((key) => {
                        const assignedRoom = rooms.find(r => r.id === key.room_id);
                        return (
                          <tr key={key.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-gray-800">{key.key_number}</td>
                            <td className="px-6 py-4">
                              {assignedRoom ? (
                                <span className="font-medium text-primary">Room {assignedRoom.room_number}</span>
                              ) : <span className="text-red-500 italic">Unassigned</span>}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`status-badge ${key.status === 'available' ? 'bg-green-100 text-green-700' :
                                key.status === 'issued' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                {key.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 flex gap-3 justify-end">
                              <button onClick={() => handleKeyModal(key)} className="text-blue-600 hover:text-blue-800 font-medium">
                                <Pencil size={16} />
                              </button>
                              <button onClick={() => handleDeleteKey(key.id)} className="text-red-600 hover:text-red-800 font-medium">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredKeys.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400">No keys found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
               {resourceView === 'dates' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs md:text-sm uppercase whitespace-nowrap">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Date Range</th>
                        <th className="px-6 py-4 font-semibold">Reason</th>
                        <th className="px-6 py-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {blockedDates.map(bd => {
                        const formatDate = (d: string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                        const start = formatDate(bd.start_date);
                        const end = formatDate(bd.end_date);
                        const isSameDay = bd.start_date === bd.end_date;

                        return (
                          <tr key={bd.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-900">
                              {isSameDay ? start : `${start} - ${end}`}
                            </td>
                            <td className="px-6 py-4 text-gray-600">{bd.reason}</td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => handleUnblockDate(bd.id)} className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center justify-end gap-1 ml-auto">
                                <Trash2 size={14} /> Unblock
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {blockedDates.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-gray-400">No blocked dates found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- ACTIVITY TAB (COMBINED LOGS & REPORTS) --- */}
        {activeTab === 'activity' && (
           <div className="w-full">
            {/* Sub Nav & Filters */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
               <div className="flex gap-4 items-center">
                  <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                    <button 
                      onClick={() => handleActivityViewChange('logs')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activityView === 'logs' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      System Logs
                    </button>
                    <button 
                      onClick={() => handleActivityViewChange('issues')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activityView === 'issues' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Issues / Reports
                    </button>
                  </div>

                  {/* Dropdown Filter for Logs */}
                  {activityView === 'logs' && (
                    <div className="relative" ref={filterRef}>
                      <button 
                        onClick={() => setShowLogFilterDropdown(!showLogFilterDropdown)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors shadow-sm ${logFilter !== 'all' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                         <Filter size={14} />
                         <span>{logFilter === 'all' ? 'Filter' : logFilter}</span>
                         <ChevronDown size={14} className={`transition-transform duration-200 ${showLogFilterDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showLogFilterDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                           <div className="py-1 max-h-[300px] overflow-y-auto">
                              <button 
                                onClick={() => { setLogFilter('all'); setShowLogFilterDropdown(false); }}
                                className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 ${logFilter === 'all' ? 'text-primary font-bold bg-primary/5' : 'text-gray-700'}`}
                              >
                                All Actions
                              </button>
                              {LOG_ACTIONS.map(action => (
                                <button
                                  key={action}
                                  onClick={() => { setLogFilter(action); setShowLogFilterDropdown(false); }}
                                  className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 ${logFilter === action ? 'text-primary font-bold bg-primary/5' : 'text-gray-700'}`}
                                >
                                  {action}
                                </button>
                              ))}
                           </div>
                        </div>
                      )}
                    </div>
                  )}
               </div>

               <SearchInput
                placeholder={activityView === 'logs' ? "Search logs..." : "Search issues..."}
                value={searchQuery}
                onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
               />
            </div>

            {/* View Content */}
            <div className="overflow-x-auto">
              {activityView === 'logs' ? (
                 <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase">
                      <tr>
                        <th className="px-6 py-4 font-semibold w-48">Timestamp</th>
                        <th className="px-6 py-4 font-semibold w-48">Admin</th>
                        <th className="px-6 py-4 font-semibold w-64">Action</th>
                        <th className="px-6 py-4 font-semibold">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredLogs.slice(startIndex, endIndex).map(log => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                            {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{log.admin?.full_name || 'System / Professor'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-primary">{log.action}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                              {log.details ? (
                                <div className="max-w-md truncate" title={JSON.stringify(log.details, null, 2)}>
                                  {renderLogDetails(log.details)}
                                </div>
                              ) : '-'}
                          </td>
                        </tr>
                      ))}
                      {filteredLogs.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400">No logs found matching your criteria.</td></tr>}
                    </tbody>
                 </table>
              ) : (
                 <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Issue</th>
                      <th className="px-6 py-4 font-semibold">Context</th>
                      <th className="px-6 py-4 font-semibold">Reporter</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredReports.slice(startIndex, endIndex).map(rep => (
                      <tr key={rep.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`status-badge ${rep.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{rep.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{rep.title}</div>
                          <div className="text-xs text-gray-500 mt-1 max-w-xs">{rep.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          {rep.room && <div className="text-xs bg-gray-100 inline-block px-2 py-1 rounded font-medium text-gray-700">Room {rep.room.room_number}</div>}
                          {rep.equipment && <div className="text-xs bg-blue-50 inline-block px-2 py-1 rounded ml-1 font-medium text-blue-700">{rep.equipment.name}</div>}
                          {!rep.room && !rep.equipment && <span className="text-gray-400 text-xs">General</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{rep.reporter?.full_name}</div>
                          <div className="text-xs text-gray-400">{rep.reporter?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{new Date(rep.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          {rep.status === 'open' && (
                            <button onClick={() => resolveReport(rep.id)} className="text-green-600 hover:text-green-800 flex items-center justify-end gap-1 ml-auto font-medium text-xs bg-green-50 px-2 py-1 rounded">
                              <CheckCircle2 size={14} /> Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredReports.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">No active incident reports.</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
           </div>
        )}

        {/* --- STUDENTS TAB --- */}
        {activeTab === 'students' && (
          <div className="w-full">
             {/* ... (Existing students UI code) ... */}
             <div className="p-4 border-b border-gray-100 flex justify-end bg-gray-50/50">
              <SearchInput
                placeholder={`Search students...`}
                value={searchQuery}
                onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs md:text-sm uppercase whitespace-nowrap">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Student</th>
                    <th className="px-6 py-4 font-semibold">ID / Program</th>
                    <th className="px-6 py-4 font-semibold">COR</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredStudents.slice(startIndex, endIndex).map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{student.full_name}</div>
                        <div className="text-xs text-gray-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-gray-700">{student.student_number}</div>
                        <div className="text-xs text-gray-500">{student.program} {student.year_section}</div>
                      </td>
                      <td className="px-6 py-4">
                        {student.cor_url ? (
                          <button onClick={() => setViewingCOR(student.cor_url!)} className="text-primary hover:underline flex items-center gap-1 font-medium text-xs">
                            View <ExternalLink size={12} />
                          </button>
                        ) : <span className="text-gray-400 text-xs">No File</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`status-badge ${student.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {student.is_verified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleVerifyStudent(student.id, student.is_verified)} className={`btn px-3 py-1 text-xs ${student.is_verified ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'btn-primary'}`}>
                          {student.is_verified ? 'Revoke' : 'Verify'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">No students found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- RESERVATIONS TAB --- */}
        {activeTab === 'reservations' && (
          <div className="w-full">
             {/* ... (Existing reservations UI code) ... */}
             <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <span className="flex items-center text-gray-400 mr-1"><Filter size={16} /></span>
                {(['pending', 'verified', 'cancelled', 'all'] as const).map((filter) => (
                  <button key={filter} onClick={() => handleFilterChange(filter)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full capitalize transition-colors whitespace-nowrap ${reservationFilter === filter ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                  >{filter}</button>
                ))}
              </div>

              <SearchInput
                placeholder={`Search reservations...`}
                value={searchQuery}
                onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs md:text-sm uppercase whitespace-nowrap">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-[100px]">Ref #</th>
                    <th className="px-6 py-4 font-semibold">Student</th>
                    <th className="px-6 py-4 font-semibold">Room / Time</th>
                    <th className="px-6 py-4 font-semibold">Professor</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {displayedReservations.slice(startIndex, endIndex).map((res) => {
                    const keyStatus = res.key_issuance?.[0]?.status;
                    const reservationEnd = new Date(`${res.date_reserved}T${res.time_end}`);
                    const isOvertime = keyStatus === 'issued' && new Date() > reservationEnd;

                    return (
                      <tr
                        key={res.id}
                        onClick={() => setSelectedRes(res)}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${isOvertime ? 'bg-red-50 hover:bg-red-100' : ''}`}
                      >
                        <td className="px-6 py-4 font-mono text-xs text-primary font-bold">
                          {res.reservation_number || '---'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{res.profile?.full_name}</div>
                          <div className="text-xs text-gray-500">{res.profile?.program}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-gray-800 text-lg">{res.room?.room_number}</div>
                          <div className="text-xs text-gray-500 flex flex-col">
                            <span>{res.date_reserved ? format(new Date(res.date_reserved), 'MMM dd, yyyy') : '-'}</span>
                            <span>{res.time_start} - {res.time_end}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{res.professor_name}</div>

                          {/* NEW: Professor Status Indicator */}
                          <div className="mt-1">
                            {res.professor_status === 'confirmed' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                <CheckCircle2 size={10} /> Accepted
                              </span>
                            )}
                            {res.professor_status === 'declined' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                                <XCircle size={10} /> Declined
                              </span>
                            )}
                            {(res.professor_status === 'pending' || !res.professor_status) && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                <Clock size={10} /> Pending
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isOvertime ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">
                              <AlertTriangle size={12} className="mr-1" /> OVERTIME
                            </span>
                          ) : (
                            <span className={`status-badge ${res.status === 'verified' || res.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              res.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                res.status === 'cancelled' ? 'bg-orange-100 text-orange-700' :
                                  'bg-yellow-100 text-yellow-700'
                              }`}>
                              {keyStatus === 'issued' ? 'Key Issued' : res.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {res.status === 'pending' || res.status === 'verified' || res.status === 'confirmed' ? (
                            <button className="text-primary hover:underline font-medium text-sm">Manage</button>
                          ) : (
                            <button className="text-gray-500 hover:text-gray-700 font-medium text-sm">View</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && displayedReservations.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">No records found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- PAGINATION CONTROLS --- */}
        {activeTab !== 'analytics' && totalItems > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 bg-white">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
            {/* Mobile View Pagination */}
            <div className="flex items-center justify-between w-full sm:hidden">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe shadow-up">
        <div className="flex justify-around items-center px-1 overflow-x-auto">
          {renderMobileNavItem('reservations', Clock, 'Reserve')}
          {renderMobileNavItem('resources', Layers, 'Assets')}
          {renderMobileNavItem('students', Users, 'Users')}
          {renderMobileNavItem('activity', ScrollText, 'Activity')}
          {renderMobileNavItem('analytics', BarChart3, 'Data')}
        </div>
      </div>

      {/* Modals */}
      {selectedRes && (
        <AdminRequestModal
          reservation={selectedRes}
          close={() => { setSelectedRes(null); handleRefresh(); }}
          mode={['verified', 'confirmed'].includes(selectedRes.status) ? 'keys' : (selectedRes.status === 'pending' ? 'pending' : 'history')}
        />
      )}

      {showRoomModal && <AdminRoomModal room={selectedRoom} close={() => setShowRoomModal(false)} onSuccess={handleRefresh} />}
      {showKeyModal && <AdminKeyModal keyData={selectedKey} rooms={rooms} close={() => setShowKeyModal(false)} onSuccess={handleRefresh} />}
      {showEqModal && <AdminEquipmentModal equipment={selectedEquipment} close={() => setShowEqModal(false)} onSuccess={handleRefresh} />}
      {showDateModal && <AdminBlockDateModal close={() => setShowDateModal(false)} onSuccess={handleRefresh} />}

      {viewingCOR && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl aspect-video md:aspect-auto md:h-[90vh] flex flex-col overflow-hidden">

            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">COR Viewer</h3>
              <button onClick={() => setViewingCOR(null)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
            </div>
            <div className="flex-1 bg-gray-100 relative w-full h-full">
              <iframe
                src={viewingCOR.includes('drive.google.com') ? viewingCOR.replace('/view', '/preview') : viewingCOR}
                className="w-full h-full border-0 block"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}