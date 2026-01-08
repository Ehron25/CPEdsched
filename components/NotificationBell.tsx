'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface NotificationBellProps {
  userId: string;
  role?: string;
}

export default function NotificationBell({ userId, role }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) {
        setNotifications(data as Notification[]);
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
      }
    };

    fetchNotifs();

    // Realtime subscription
    const channel = supabase
      .channel('realtime-notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications', 
        filter: `user_id=eq.${userId}` 
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, supabase]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async () => {
    if (unreadCount === 0) return;
    
    // Optimistic update
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    setNotifications(updated);
    setUnreadCount(0);

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  };

  const handleToggle = () => {
    if (!isOpen) markAsRead();
    setIsOpen(!isOpen);
  };

  // Determine where to click
  const targetLink = role === 'admin' ? '/admin/dashboard' : '/reservations';

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-700">Notifications</h3>
            <span className="text-xs text-gray-400">{notifications.length} Recent</span>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No notifications yet</div>
            ) : (
              notifications.map((notif) => (
                <Link 
                  href={targetLink}
                  onClick={() => setIsOpen(false)}
                  key={notif.id} 
                  className={`block p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      notif.type === 'success' ? 'bg-green-500' : 
                      notif.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}