import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware' // You'll need to create this simple helper too, or use standard Supabase middleware pattern

export async function middleware(request: NextRequest) {
  // Standard Supabase auth middleware logic here
  // This ensures users are logged in before accessing /dashboard or /admin
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/reservations/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
}