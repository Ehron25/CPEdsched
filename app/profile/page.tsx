'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Lock, Save, ExternalLink, Phone, AlertCircle } from 'lucide-react';
import { Profile } from '@/types';

export default function ProfilePage() {
  const [supabase] = useState(() => createClient());
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Form States
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [corUrl, setCorUrl] = useState('');
  const [yearSection, setYearSection] = useState('');
  
  // Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile(data);
          setFullName(data.full_name || '');
          setContactNumber(data.contact_number || '');
          setCorUrl(data.cor_url || '');
          setYearSection(data.year_section || '');
        }
      }
    };
    fetchProfile();
  }, [supabase]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!profile) return;

    // Check if verification-critical fields have changed
    const isNameChanged = fullName !== profile.full_name;
    const isSectionChanged = yearSection !== profile.year_section;
    const isCorChanged = corUrl !== profile.cor_url;
    
    // If any of these critical fields change, we reset verification
    const willResetVerification = isNameChanged || isSectionChanged || isCorChanged;

    if (willResetVerification && profile.is_verified) {
      const confirmed = confirm(
        "Warning: Changing your Name, Year/Section, or COR Link will reset your verification status. You will need to be verified by an admin again. Continue?"
      );
      if (!confirmed) return;
    }

    setLoading(true);

    try {
      const updates: Partial<Profile> = { 
        full_name: fullName,
        contact_number: contactNumber, 
        cor_url: corUrl,
        year_section: yearSection
      };

      if (willResetVerification) {
        updates.is_verified = false;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, ...updates } as Profile);
      
      if (willResetVerification) {
        alert('Profile updated. Your account is now unverified pending admin review of your new details.');
      } else {
        alert('Profile information updated successfully.');
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return alert("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return alert("Passwords do not match");
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      alert('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* User Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm md:col-span-1 h-fit">
          <div className="flex flex-col items-center text-center w-full">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <User size={40} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{profile.full_name}</h2>
            <p className="text-sm text-gray-500 mb-1 break-all px-2">{profile.email}</p>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase mt-2 ${
              profile.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {profile.is_verified ? 'Verified Student' : 'Unverified'}
            </span>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Student No.</span>
              <span className="font-mono font-medium">{profile.student_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Program</span>
              <span className="font-medium">{profile.program}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Section</span>
              <span className="font-medium">{profile.year_section}</span>
            </div>
          </div>
        </div>

        {/* Edit Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* General Info Form */}
          <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Phone size={18} className="text-primary"/> Update Information
            </h3>

            {/* Warning Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-5 flex gap-3 text-sm text-yellow-800">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Verification Notice</p>
                <p className="text-yellow-700/80">
                  Editing your <strong>Name</strong>, <strong>Year & Section</strong>, or <strong>COR Link</strong> will automatically reset your verification status to <strong>Unverified</strong>. 
                  You will need to upload a valid COR link and wait for admin approval again.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="input-field" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year & Section</label>
                  <input 
                    type="text" 
                    required
                    className="input-field" 
                    placeholder="e.g. 4-1"
                    value={yearSection} 
                    onChange={(e) => setYearSection(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input 
                    type="text" 
                    required
                    className="input-field" 
                    value={contactNumber} 
                    onChange={(e) => setContactNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">COR Link (Google Drive/SharePoint)</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    required
                    className="input-field" 
                    value={corUrl} 
                    onChange={(e) => setCorUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  {corUrl && (
                    <a href={corUrl} target="_blank" rel="noreferrer" className="btn bg-gray-100 text-gray-600 px-3">
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={loading} className="btn btn-primary">
                  <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>

          {/* Password Form */}
          <form onSubmit={handleUpdatePassword} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock size={18} className="text-primary"/> Security
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={loading || !newPassword} className="btn btn-secondary">
                  Update Password
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}