'use client';
import { useState, useEffect } from 'react';
import { Room } from '@/types';
import ReservationModal from './ReservationModal';
import { createClient } from '@/utils/supabase/client';

export default function ReservationClientWrapper({ room, isVerified }: { room: Room, isVerified: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBusinessHours, setIsBusinessHours] = useState<boolean | null>(null);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkStatus = async () => {
      const now = new Date();
      
      // 1. Check Business Hours (8 AM - 5 PM)
      // Uncomment to enable strict business hour checking
      /*
      const h = now.getHours();
      setIsBusinessHours(h >= 8 && h < 17); 
      */
      setIsBusinessHours(true); // Temporarily forced open for testing/demo

      // 2. Check Blocked Dates (for TODAY)
      // Get date in YYYY-MM-DD format based on local time
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      // CHANGED: Check if today falls between start_date and end_date
      const { data } = await supabase
        .from('blocked_dates')
        .select('reason')
        .lte('start_date', todayStr) // Start date must be before or equal to today
        .gte('end_date', todayStr)   // End date must be after or equal to today
        .limit(1)
        .maybeSingle();

      if (data) {
        setBlockedReason(data.reason);
      } else {
        setBlockedReason(null);
      }
    };

    checkStatus();
    
    // Re-check every minute to keep status fresh
    const interval = setInterval(checkStatus, 60000); 
    return () => clearInterval(interval);
  }, [supabase]);

  // Determine button state
  const isAvailable = room.status === 'available';
  const isLoading = isBusinessHours === null;
  const isClosed = isBusinessHours === false;

  // Disable button logic
  const isDisabled = isLoading || !isAvailable || !isVerified || isClosed || !!blockedReason;
  
  let buttonText = 'Reserve Now';
  
  if (isLoading) {
    buttonText = 'Loading...';
  } else if (blockedReason) {
    buttonText = `Closed - ${blockedReason}`;
  } else if (!isVerified) {
    buttonText = 'Verification Pending';
  } else if (isClosed) {
    buttonText = 'Closed (8AM-5PM)';
  } else if (!isAvailable) {
    buttonText = 'Unavailable';
  }

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        disabled={isDisabled}
        className={`w-full btn ${!isDisabled ? 'btn-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
      >
        {buttonText}
      </button>

      {/* Only render modal if open, verified, within business hours, and not blocked */}
      {isModalOpen && isVerified && isBusinessHours && !blockedReason && (
        <ReservationModal room={room} closeModal={() => setIsModalOpen(false)} />
      )}
    </>
  );
}