import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const currentPath = request.nextUrl.pathname;

  // Static files and internal Next.js paths
  if (currentPath.startsWith('/_next') || currentPath.includes('/api/')) {
    return supabaseResponse
  }

  // Public routes that don't need auth
  const isAuthRoute = currentPath.startsWith('/login') || currentPath.startsWith('/signup') || currentPath === '/';

  // Routes to protect
  const isProtectedRoute = currentPath.startsWith('/dashboard') || currentPath.startsWith('/manager') || currentPath.startsWith('/admin') || currentPath.startsWith('/pending');

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // Fetch user profile to check role and status
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, status')
      .eq('id', user.id)
      .single();

    if (profile) {
      if (profile.status === 'pending' && currentPath !== '/pending' && currentPath !== '/login' && currentPath !== '/signup') {
         // Force pending users to the pending page, unless they are trying to log out
         const url = request.nextUrl.clone()
         url.pathname = '/pending'
         return NextResponse.redirect(url)
      }

      if (profile.status === 'approved') {
        // If user goes to /login while logged in and approved
        if (isAuthRoute || currentPath === '/pending') {
             const url = request.nextUrl.clone()
             // Redirect based on role
             if (profile.role === 'super_admin') url.pathname = '/admin';
             else if (profile.role === 'manager') url.pathname = '/manager';
             else url.pathname = '/dashboard';
             return NextResponse.redirect(url)
        }

        // Role-based route protection
        if (currentPath.startsWith('/admin') && profile.role !== 'super_admin') {
           const url = request.nextUrl.clone()
           url.pathname = '/dashboard'
           return NextResponse.redirect(url)
        }

        if (currentPath.startsWith('/manager') && profile.role !== 'manager' && profile.role !== 'super_admin') {
           const url = request.nextUrl.clone()
           url.pathname = '/dashboard'
           return NextResponse.redirect(url)
        }
      }
    }
  }

  return supabaseResponse
}
