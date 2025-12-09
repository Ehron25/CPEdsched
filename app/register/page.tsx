'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', middleName: '', lastName: '',
    studentNumber: '', contactNumber: '',
    program: '', yearSection: '',
    corUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Helper for Number-Only Inputs (Contact Number)
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setFormData({ ...formData, [field]: value });
    }
  };

  // Helper for Student Number
  const handleStudentNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[a-zA-Z0-9-]*$/.test(value)) {
      setFormData({ ...formData, studentNumber: value.toUpperCase() });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // --- VALIDATIONS ---
    // if (!formData.email.endsWith('@iskolarngbayan.pup.edu.ph')) {
    //   setError("Please use your official PUP Webmail (@iskolarngbayan.pup.edu.ph)");
    //   return;
    // }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.contactNumber.length !== 11 || !formData.contactNumber.startsWith('09')) {
      setError("Please enter a valid 11-digit mobile number starting with 09");
      return;
    }
    if (formData.studentNumber.length < 5) {
      setError("Please enter a valid Student Number");
      return;
    }

    setLoading(true);

    try {
      // 1. CHECK UNIQUENESS (Database Check)
      const checkRes = await fetch('/api/check-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          studentNumber: formData.studentNumber 
        })
      });

      const checkData = await checkRes.json();

      if (!checkData.available) {
        throw new Error(checkData.message); // Stops execution here if duplicate
      }

      // 2. PROCEED WITH REGISTRATION (Supabase Auth)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim(),
            student_number: formData.studentNumber,
            contact_number: formData.contactNumber,
            program: formData.program,
            year_section: formData.yearSection,
            cor_url: formData.corUrl,
            role: 'student'
          }
        }
      });

      if (authError) throw authError;
      
      if (authData.user && !authData.session) {
         alert("Registration successful! Please check your email to verify your account.");
      } else {
         alert("Registration successful!");
      }
      
      router.push('/login');

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary to-secondary p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col md:flex-row min-h-[600px] relative">
        
        {/* Right Column (Image) */}
        <div className="w-full aspect-video md:aspect-auto md:h-auto md:w-1/2 relative flex flex-col items-center justify-center p-4 md:p-12 text-center text-white glass-panel order-first md:order-last animate-slide-from-left z-20">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/pup-image.jpg" 
              alt="PUP Campus" 
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="glass-overlay"></div>
          
          <div className="relative z-20 flex flex-col items-center justify-center h-full">
            <div className="relative w-16 h-16 md:w-48 md:h-48 mb-2 md:mb-6 mx-auto drop-shadow-2xl">
               <Image 
                 src="/PUPLogo.png" 
                 alt="PUP Logo" 
                 fill
                 className="object-contain"
                 priority
               />
            </div>
            <h2 className="text-lg md:text-3xl font-bold mb-0 md:mb-2 text-white drop-shadow-md leading-tight">Polytechnic University of the Philippines</h2>
            <h3 className="text-sm md:text-xl font-medium text-white/90 tracking-wide">CPED Scheduler</h3>
            
            <div className="mt-4 md:mt-8 pt-4 md:pt-8 border-t border-white/20 w-full max-w-xs mx-auto">
              <p className="text-xs md:text-sm text-white/80 mb-2">Already have an account?</p>
              <Link href="/login" className="text-white font-bold text-sm md:text-base hover:underline hover:text-white/90 transition-colors">
                Sign In instead
              </Link>
            </div>
          </div>
        </div>

        {/* Left Column (Form) */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white order-last md:order-first animate-fade-in z-10 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center md:text-left">Student Registration</h1>
          
          {/* ERROR DISPLAY */}
          {error && <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 font-medium flex items-center gap-2">
             ⚠️ {error}
          </div>}

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ... Form Inputs (Same as before) ... */}
            <div className="md:col-span-2 font-semibold text-gray-900 border-b border-gray-100 pb-2 mt-2 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span> Personal Information
            </div>
            <input required placeholder="First Name" className="input-field bg-gray-50" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
            <input placeholder="Middle Name" className="input-field bg-gray-50" value={formData.middleName} onChange={e => setFormData({ ...formData, middleName: e.target.value })} />
            <input required placeholder="Last Name" className="input-field bg-gray-50" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
            
            <input 
              required 
              placeholder="Contact (09xxxxxxxxx)" 
              className="input-field bg-gray-50" 
              value={formData.contactNumber}
              maxLength={11}
              onChange={(e) => handleNumberInput(e, 'contactNumber')} 
            />

            <div className="md:col-span-2 font-semibold text-gray-900 border-b border-gray-100 pb-2 mt-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span> Academic Information
            </div>
            
            <input 
              required 
              placeholder="Student Number (e.g., 2020-00000-MN-0)" 
              className="input-field bg-gray-50" 
              value={formData.studentNumber}
              onChange={handleStudentNumberInput} 
            />
            
            <input required placeholder="Webmail" type="email" className="input-field bg-gray-50" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />

            <select className="input-field bg-gray-50" required value={formData.program} onChange={e => setFormData({ ...formData, program: e.target.value })}>
              <option value="">Select Program</option>
              <option value="BSCpE">BS Computer Engineering</option>
              <option value="BSECE">BS Electronics Engineering</option>
            </select>
            <input required placeholder="Year & Section (e.g. 4-1)" className="input-field bg-gray-50" value={formData.yearSection} onChange={e => setFormData({ ...formData, yearSection: e.target.value })} />

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">COR Link (Google Drive/SharePoint)</label>
              <input 
                required 
                type="url"
                placeholder="https://drive.google.com/..." 
                className="input-field bg-gray-50" 
                value={formData.corUrl}
                onChange={e => setFormData({ ...formData, corUrl: e.target.value })} 
              />
            </div>

            <div className="md:col-span-2 font-semibold text-gray-900 border-b border-gray-100 pb-2 mt-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span> Security
            </div>
            <input required type="password" placeholder="Password (Min. 6 chars)" className="input-field bg-gray-50" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            <input required type="password" placeholder="Confirm Password" className="input-field bg-gray-50" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />

            <div className="md:col-span-2 mt-6">
              <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                {loading ? 'Checking...' : 'Submit Registration'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}