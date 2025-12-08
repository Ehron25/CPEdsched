'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Fetch role to know where to redirect
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (profile?.role === 'admin') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/dashboard');
        }
      }
    };
    checkSession();
  }, [router, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();

      // Use window.location.href to force a full reload.
      // This ensures the RootLayout (server component) re-runs, fetches the user,
      // and passes the user object to the Navbar so it appears immediately.
      if (profile?.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary to-secondary p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row min-h-[600px] relative">
        
        {/* Left Column: Image (Glassmorphism) */}
        <div className="w-full aspect-video md:aspect-auto md:h-auto md:w-1/2 relative flex flex-col items-center justify-center p-4 md:p-12 text-center text-white glass-panel order-first animate-slide-from-right z-20">
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
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white animate-fade-in z-10 flex-1">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Sign in to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Webmail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="input-field pl-10 w-full bg-gray-50"
                  placeholder="yourname@iskolarngbayan.pup.edu.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="input-field pl-10 w-full bg-gray-50"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-primary hover:text-primary-hover hover:underline transition-colors">
              Register here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}