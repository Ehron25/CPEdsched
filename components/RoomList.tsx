'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Cpu, Tv, Wind, Monitor, PenTool } from 'lucide-react';
import { Room } from '@/types';
import ReservationClientWrapper from "@/components/ReservationClientWrapper";
import { createClient } from '@/utils/supabase/client';

interface RoomListProps {
  rooms: Room[];
  isVerified: boolean;
}

// Icon mapper helper
const getFeatureIcon = (feature: string) => {
  const lower = feature.toLowerCase();
  if (lower.includes('air')) return <Wind size={12} />;
  if (lower.includes('tv')) return <Tv size={12} />;
  if (lower.includes('computer')) return <Monitor size={12} />;
  if (lower.includes('projector')) return <PenTool size={12} />; // approximation
  if (lower.includes('lab')) return <Cpu size={12} />;
  return null;
};

export default function RoomList({ rooms: initialRooms, isVerified }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<string>('All');
  const [selectedFeature, setSelectedFeature] = useState<string>('All'); // NEW FILTER
  const [showFilter, setShowFilter] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setRooms(initialRooms);
  }, [initialRooms]);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase.from('rooms').select('*').order('room_number');
      if (data) setRooms(data as Room[]);
    };

    const channel = supabase
      .channel('room-list-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => fetchRooms())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  // Derived Filters
  const floors = ['All', ...Array.from(new Set(rooms.map(r => r.floor || 'Unknown'))).sort()];
  
  // Extract all unique features across all rooms
  const allFeatures = Array.from(new Set(rooms.flatMap(r => r.features || []))).sort();
  const featuresList = ['All', ...allFeatures];

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = 
      room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFloor = selectedFloor === 'All' || room.floor === selectedFloor;
    
    // Check if room has the selected feature
    const matchesFeature = selectedFeature === 'All' || (room.features && room.features.includes(selectedFeature));

    return matchesSearch && matchesFloor && matchesFeature;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap sm:flex-nowrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search room..."
            className="input-field pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button 
          onClick={() => setShowFilter(!showFilter)} 
          className={`btn ${showFilter ? 'bg-gray-200 text-gray-800' : 'bg-white border border-gray-300 text-gray-600'} hover:bg-gray-100 px-3`}
        >
          <Filter size={20} />
          <span className="hidden sm:inline text-sm">Filters</span>
        </button>

        {showFilter && (
          <div className="flex gap-2 w-full sm:w-auto animate-fade-in flex-wrap">
            <select 
              className="input-field bg-gray-50 border-gray-200 text-sm py-2 h-10 w-full sm:w-auto"
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
            >
              <option value="All">All Floors</option>
              {floors.filter(f => f !== 'All').map(floor => (
                <option key={floor} value={floor}>{floor} Floor</option>
              ))}
            </select>

            {/* Feature Filter */}
            <select 
              className="input-field bg-gray-50 border-gray-200 text-sm py-2 h-10 w-full sm:w-auto"
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
            >
              <option value="All">All Features</option>
              {featuresList.filter(f => f !== 'All').map(feature => (
                <option key={feature} value={feature}>{feature}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <div key={room.id} className="card hover:shadow-md transition-shadow group relative flex flex-col h-full">
              <div className="h-32 bg-linear-to-r from-gray-100 to-gray-200 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold text-4xl opacity-20">
                  {room.room_number}
                </div>
                <div className={`absolute top-3 right-3 status-badge ${
                  room.status === 'available' ? 'bg-green-100 text-green-700' : 
                  room.status === 'maintenance' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {room.status}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">Room {room.room_number}</h3>
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {room.floor || 'G'} Floor
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-2">{room.type} • Capacity: {room.capacity}</p>
                
                {/* Features Badges */}
                {room.features && room.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {room.features.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {getFeatureIcon(feature)} {feature}
                      </span>
                    ))}
                    {room.features.length > 3 && (
                      <span className="text-[10px] text-gray-400 py-0.5">+{room.features.length - 3} more</span>
                    )}
                  </div>
                )}

                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">{room.description}</p>
                
                <div className="mt-auto">
                  <ReservationClientWrapper 
                    room={room} 
                    isVerified={isVerified} 
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
            <Search className="h-10 w-10 text-gray-300 mb-2" />
            <p>No rooms found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}