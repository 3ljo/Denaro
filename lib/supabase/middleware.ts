import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// This runs on EVERY request (see middleware.ts at the project root).
// Its job: refresh the access token if expired, write the new cookies to the
// response, and (optionally) redirect unauthenticated users away from
// protected routes.
//
// Without this, expired tokens never get refreshed and users keep getting
// logged out every hour. This is why httpOnly cookies need middleware.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CRITICAL: Use getUser(), not getSession(). getUser() makes a request to
  // Supabase to validate the JWT against their server. getSession() trusts
  // the cookie blindly and is unsafe to use for authorization decisions.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Protected routes — redirect to /login if not signed in
  const isProtected = path.startsWith('/dashboard')
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // Auth pages — redirect to /dashboard if already signed in
  const isAuthPage =
    path === '/login' ||
    path === '/register' ||
    path === '/forgot-password'
  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
