'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import NotificationBell from './NotificationBell';

export default function Navbar({ user, role }: { user: User | null, role?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();
  const pathname = usePathname();

  if (!user) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const dashboardLink = role === 'admin' ? '/admin/dashboard' : '/dashboard';

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Clickable Logo */}
            <Link href={dashboardLink} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image src="/android-chrome-512x512.png" alt="Logo" width={32} height={32} className="h-8 w-8"/>
              <span className="font-bold text-xl tracking-tight text-primary">CPEdSched</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-6 items-center">
              {role === 'admin' ? (
                <Link href="/admin/dashboard" className={`text-sm font-medium ${pathname === '/admin/dashboard' ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                  Admin Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/dashboard" className={`text-sm font-medium ${pathname === '/dashboard' ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                    Dashboard
                  </Link>
                  <Link href="/reservations" className={`text-sm font-medium ${pathname === '/reservations' ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                    My Reservations
                  </Link>
                  <Link href="/dashboard/manual" className={`text-sm font-medium ${pathname === '/dashboard/manual' ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                    Mini Manual
                  </Link>
                  
                  {/* FAQs and About moved inside non-admin block */}
                  <Link href="/faqs" className={`text-sm font-medium ${pathname === '/faqs' ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                    FAQs
                  </Link>
                  <Link href="/about" className={`text-sm font-medium ${pathname === '/about' ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                    About
                  </Link>
                </>
              )}
              
              <div className="h-6 w-px bg-gray-200 mx-1"></div>
              
              {/* Notification Bell - Desktop */}
              <NotificationBell userId={user.id} role={role} />

              {/* Profile Link - HIDDEN FOR ADMINS */}
              {role !== 'admin' && (
                <Link href="/profile" className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${pathname === '/profile' ? 'text-primary' : 'text-gray-500'}`}>
                   <UserIcon size={20} />
                </Link>
              )}
              
              <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center gap-1 ml-2">
                <LogOut size={16} /> Logout
              </button>
            </nav>

            {/* Mobile Actions: Notification + Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Notification Bell - Mobile */}
              <NotificationBell userId={user.id} role={role} />

              {/* Mobile Menu Button */}
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" onClick={() => setIsOpen(true)}>
                <Menu />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full Screen Mobile Menu Overlay (Sliding from Right) */}
      <div className={`fixed inset-0 z-60 bg-primary transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full text-white">
           {/* Mobile Menu Header */}
           <div className="flex justify-between items-center px-4 h-16 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                  <div className="bg-white rounded-full p-0.5">
                    <Image src="/android-chrome-512x512.png" alt="Logo" width={28} height={28} className="h-7 w-7"/>
                  </div>
                  <span className="font-bold text-xl tracking-tight">CPEdSched</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
              </button>
           </div>

           {/* Links */}
           <div className="flex-1 px-6 py-8 space-y-6 overflow-y-auto">
              <Link href={dashboardLink} onClick={() => setIsOpen(false)} className="block text-2xl font-medium hover:text-secondary transition-colors">
                {role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
              </Link>
              
              {role !== 'admin' && (
                <>
                  <Link href="/reservations" onClick={() => setIsOpen(false)} className="block text-2xl font-medium hover:text-secondary transition-colors">
                    My Reservations
                  </Link>
                  <Link href="/dashboard/manual" onClick={() => setIsOpen(false)} className="block text-2xl font-medium hover:text-secondary transition-colors">
                    Mini Manual
                  </Link>
                  <Link href="/profile" onClick={() => setIsOpen(false)} className="block text-2xl font-medium hover:text-secondary transition-colors">
                    My Profile
                  </Link>
                  
                  {/* FAQs and About moved inside non-admin block */}
                  <Link href="/faqs" onClick={() => setIsOpen(false)} className="block text-2xl font-medium hover:text-secondary transition-colors">
                    FAQs
                  </Link>
                  <Link href="/about" onClick={() => setIsOpen(false)} className="block text-2xl font-medium hover:text-secondary transition-colors">
                    About
                  </Link>
                </>
              )}

              <button onClick={() => { setIsOpen(false); handleLogout(); }} className="flex items-center gap-2 text-2xl font-medium text-white/80 hover:text-white mt-8">
                 <LogOut size={24} /> Logout
              </button>
           </div>

           {/* Footer: Support Notice */}
           <div className="p-6 border-t border-white/10 shrink-0 bg-primary-hover/20 lg:hidden">
              <p className="font-bold text-secondary mb-2 text-2xl">Need Support?</p>
              <a href="mailto:cpedsched@gmail.com" className="block text-xl underline hover:text-white font-medium text-white/90">
                cpedsched@gmail.com
              </a>
           </div>
        </div>
      </div>
    </>
  );
}