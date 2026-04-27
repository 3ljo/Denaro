import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// This client runs on the server (Server Components, Server Actions, Route Handlers).
// It reads the session from httpOnly cookies and writes refreshed tokens back.
//
// SECURITY NOTE: We use the ANON key, not the service role key. RLS protects
// the data. The user's identity comes from their cookie-stored session JWT,
// which Supabase validates server-side via auth.getUser().
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — cookies are read-only there.
            // The middleware will refresh the session on the next request.
          }
        },
      },
    }
  )
}
