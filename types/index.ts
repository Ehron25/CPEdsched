// Matches your Supabase Enums
export type UserRole = 'student' | 'admin'; 
export type ReqStatus = 'pending' | 'verified' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
export type RoomStatus = 'available' | 'occupied' | 'maintenance';
export type ProfStatus = 'pending' | 'confirmed' | 'declined';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  student_number: string;
  program: string;
  year_section: string;
  contact_number: string;
  role: UserRole;
  is_verified: boolean;
  cor_url?: string;
}

export interface Room {
  id: string;
  room_number: string;
  type: string;
  description: string;
  capacity: number;
  status: RoomStatus;
  floor?: string;
  features?: string[];
}

export interface Equipment {
  id: string;
  name: string;
  total_quantity: number;
  available_quantity: number;
  status: 'active' | 'maintenance';
}

export interface IncidentReport {
  id: string;
  reporter_id: string;
  reservation_id?: string;
  room_id?: string;
  equipment_id?: string; // CHANGED: Points to equipment category, not specific item
  type: 'equipment' | 'room' | 'other';
  title: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  created_at: string;
  // Joined
  reporter?: Profile;
  room?: Room;
  equipment?: Equipment; // CHANGED
}

export interface ReservationEquipment {
  quantity_requested: number;
  equipment: Equipment;
}

export interface Reservation {
  id: string;
  reservation_number?: string;
  user_id: string;
  room_id: string;
  subject_code: string;
  professor_name: string;
  professor_email: string;
  professor_contact_number?: string;
  professor_status?: ProfStatus;
  date_reserved: string;
  time_start: string;
  time_end: string;
  status: ReqStatus;
  cancel_reason?: string;
  cancelled_by?: string;
  cancelled_at?: string;
  verified_by?: string;
  verified_at?: string;
  
  // Joined Data
  room?: Room;
  profile?: Profile;
  reservation_equipment?: ReservationEquipment[]; 
  
  created_at: string;
}

export interface RoomKey {
  id: string;
  key_number: string;
  status: 'available' | 'issued' | 'lost';
  room_id: string;
}

export interface ReservationWithDetails extends Reservation {
  profile: Profile;
  room: Room;
  equipment: {
    quantity_requested: number;
    equipment: {
      id?: string; // <--- Added optional ID here to fix the type error
      name: string;
    };
  }[];
  key_issuance: {
    status: string;
  }[];
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export interface BlockedDate {
  id: string;
  start_date: string; // Changed from date
  end_date: string;   // Added
  reason: string;
  created_at: string;
}