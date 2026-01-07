'use client';
import { useState } from 'react';
import { ReservationWithDetails, Room } from '@/types';
import { 
  BarChart3, 
  CalendarCheck, 
  XCircle, 
  CheckCircle, 
  Clock, 
  Download, 
  TrendingUp,
  Monitor,
  FileText,
  Table,
  ChevronDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import the autoTable plugin

interface AdminAnalyticsProps {
  reservations: ReservationWithDetails[];
  rooms: Room[];
}

export default function AdminAnalytics({ reservations, rooms }: AdminAnalyticsProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);

  // --- 1. Summary Stats ---
  const totalReservations = reservations.length;
  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const verifiedCount = reservations.filter(r => r.status === 'verified').length;
  const cancelledCount = reservations.filter(r => ['cancelled', 'rejected'].includes(r.status)).length;
  const completedCount = reservations.filter(r => r.status === 'completed').length;

  // --- 2. Room Popularity ---
  const roomStats = rooms.map(room => {
    const count = reservations.filter(r => r.room_id === room.id).length;
    return { ...room, count };
  }).sort((a, b) => b.count - a.count);

  // --- 3. Peak Hours Calculation ---
  const hoursMap = new Array(24).fill(0);
  reservations.forEach(r => {
    if (['verified', 'completed', 'confirmed'].includes(r.status)) {
      const start = parseInt(r.time_start.split(':')[0]);
      const end = parseInt(r.time_end.split(':')[0]);
      for (let i = start; i < end; i++) {
        if (i >= 0 && i < 24) hoursMap[i]++;
      }
    }
  });
  const schoolHours = hoursMap.slice(7, 21); 
  const maxHourCount = Math.max(...schoolHours, 1);

  // --- 4. Equipment Stats ---
  const equipmentStats: Record<string, number> = {};
  reservations.forEach(r => {
    r.equipment?.forEach(item => {
      const name = item.equipment?.name || 'Unknown';
      equipmentStats[name] = (equipmentStats[name] || 0) + item.quantity_requested;
    });
  });
  const topEquipment = Object.entries(equipmentStats)
    .sort(([, a], [, b]) => b - a);

  // --- 5. Export Functions ---
  
  const handleExportCSV = () => {
    // UPDATED: Custom Columns
    const headers = [
      'Room', 
      'Reservation Date', 
      'Subject', 
      'Program', 
      'Year and Sec', 
      'Student', 
      'Time in', 
      'Time out', 
      'Professor', 
      'Created At'
    ];

    const rows = reservations.map(r => [
      r.room?.room_number || 'N/A',
      r.date_reserved,
      `"${r.subject_code || 'N/A'}"`, 
      r.profile?.program || 'N/A',
      r.profile?.year_section || 'N/A',
      `"${r.profile?.full_name || 'N/A'}"`,
      r.time_start,
      r.time_end,
      `"${r.professor_name || 'N/A'}"`,
      new Date(r.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CPEDSched_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setIsExportOpen(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const today = new Date().toLocaleDateString();

    // -- Header --
    doc.setFontSize(18);
    doc.setTextColor(129, 8, 6); // Primary Color
    doc.text("CPEdSched Analytics Report", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${today}`, 14, 28);

    // -- Summary Section --
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Summary Statistics", 14, 40);

    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Count']],
      body: [
        ['Total Reservations', totalReservations],
        ['Pending Requests', pendingCount],
        ['Verified / Active', verifiedCount + completedCount],
        ['Cancelled / Rejected', cancelledCount],
      ],
      theme: 'grid',
      headStyles: { fillColor: [129, 8, 6] },
      columnStyles: { 0: { fontStyle: 'bold' } },
      margin: { left: 14, right: 14 }
    });

    // -- Room Usage Section --
    // @ts-expect-error - jspdf-autotable types workaround
    let finalY = doc.lastAutoTable.finalY + 15;
    
    doc.text("Room Utilization", 14, finalY);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Room Number', 'Type', 'Total Bookings']],
      body: roomStats.map(r => [r.room_number, r.type, r.count]),
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66] },
    });

    // -- Equipment Usage Section --
    // @ts-expect-error - jspdf-autotable types workaround
    finalY = doc.lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (finalY > 250) { doc.addPage(); finalY = 20; }

    doc.text("Equipment Inventory Usage", 14, finalY);
    
    if (topEquipment.length > 0) {
      autoTable(doc, {
        startY: finalY + 5,
        head: [['Equipment Name', 'Quantity Requested']],
        body: topEquipment,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] },
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("No equipment usage data available.", 14, finalY + 10);
      doc.setFontSize(12);
      doc.setTextColor(0);
    }

    // -- Detailed Log Section --
    // @ts-expect-error - jspdf-autotable types workaround
    finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : finalY + 20;
    
    doc.addPage(); // Start detailed logs on a fresh page
    doc.text("Detailed Reservation Logs", 14, 20);

    autoTable(doc, {
      startY: 25,
      // UPDATED: Custom Columns
      head: [['Room', 'Reservation Date', 'Subject', 'Program', 'Year and Sec', 'Student', 'Time in', 'Time out', 'Professor', 'Created At']],
      body: reservations.map(r => [
        r.room?.room_number || '-',
        r.date_reserved,
        r.subject_code || '-',
        r.profile?.program || '-',
        r.profile?.year_section || '-',
        r.profile?.full_name || 'Unknown',
        r.time_start,
        r.time_end,
        r.professor_name || '-',
        new Date(r.created_at).toLocaleDateString()
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [129, 8, 6] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // -- Footer (Page Numbers) --
    const pageCount = doc.internal.pages.length - 1; 
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }

    doc.save(`CPEDSched_Detailed_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    setIsExportOpen(false);
  };

  const getPercentage = (count: number) => totalReservations > 0 ? (count / totalReservations) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in p-1">
      
      {/* Header with Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Analytics Overview</h2>
          <p className="text-sm text-gray-500">Real-time data insights</p>
        </div>
        
        {/* Export Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="btn bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-primary shadow-sm text-sm flex items-center gap-2"
          >
            <Download size={16} /> Export Report <ChevronDown size={14} />
          </button>

          {isExportOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20">
              <button 
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <Table size={16} className="text-green-600" />
                <span>Export as CSV</span>
                <span className="text-xs text-gray-400 ml-auto">Data</span>
              </button>
              <div className="h-px bg-gray-100"></div>
              <button 
                onClick={handleExportPDF}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <FileText size={16} className="text-red-600" />
                <span>Export as PDF</span>
                <span className="text-xs text-gray-400 ml-auto">Report</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: totalReservations, icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Requests', value: pendingCount, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Verified / Active', value: verifiedCount + completedCount, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Cancelled', value: cancelledCount, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-primary" />
            Reservation Status
          </h3>
          <div className="space-y-5">
            {[
              { label: 'Completed', count: completedCount, color: 'bg-blue-500' },
              { label: 'Verified', count: verifiedCount, color: 'bg-green-500' },
              { label: 'Pending', count: pendingCount, color: 'bg-yellow-500' },
              { label: 'Cancelled/Rejected', count: cancelledCount, color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label} className="group">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="text-gray-500 font-mono">{item.count} ({Math.round(getPercentage(item.count))}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${item.color} opacity-80 group-hover:opacity-100`} 
                    style={{ width: `${getPercentage(item.count)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Rooms Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Popular Rooms
          </h3>
          <div className="space-y-3 flex-1">
            {roomStats.slice(0, 5).map((room, index) => (
              <div key={room.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-gray-800">{room.room_number}</p>
                    <p className="text-[10px] uppercase font-semibold text-gray-400">{room.type}</p>
                  </div>
                </div>
                <div className="text-sm font-bold text-primary">
                  {room.count}
                </div>
              </div>
            ))}
            {roomStats.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No data available.</p>}
          </div>
        </div>

        {/* Peak Hours Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            Peak Reservation Hours (7AM - 9PM)
          </h3>
          <p className="text-sm text-gray-500 mb-6">Based on verified and completed reservations.</p>
          
          <div className="flex items-end justify-between h-48 gap-1 md:gap-2">
            {schoolHours.map((count, i) => {
              const heightPercent = (count / maxHourCount) * 100;
              const hourLabel = i + 7; // Start at 7 AM
              const displayTime = hourLabel > 12 ? `${hourLabel - 12}pm` : `${hourLabel}am`;
              
              return (
                <div key={i} className="flex flex-col items-center justify-end h-full w-full group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {count} bookings
                  </div>
                  {/* Bar */}
                  <div 
                    className="w-full bg-primary/20 hover:bg-primary/80 rounded-t-sm transition-all duration-500 relative"
                    style={{ height: `${heightPercent}%` }}
                  >
                    {/* Top line for visual styling */}
                    <div className="absolute top-0 w-full h-1 bg-primary/50 group-hover:bg-primary"></div>
                  </div>
                  {/* Label */}
                  <span className="text-[10px] text-gray-400 mt-2 rotate-0 md:rotate-0 hidden sm:block">{displayTime}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Equipment */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Monitor size={20} className="text-primary" />
            Top Equipment
          </h3>
          <div className="space-y-4">
            {topEquipment.slice(0, 5).map(([name, count]) => (
              <div key={name} className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div className="text-xs font-semibold text-gray-700 uppercase">
                    {name}
                  </div>
                  <div className="text-xs font-bold text-primary">
                    {count} used
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                  <div 
                    style={{ width: `${(count / (topEquipment[0]?.[1] || 1)) * 100}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-secondary transition-all duration-1000"
                  ></div>
                </div>
              </div>
            ))}
            {topEquipment.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <Monitor size={40} className="mb-2 opacity-20" />
                <p className="text-sm">No equipment usage data.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}