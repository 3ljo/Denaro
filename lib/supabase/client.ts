import { createBrowserClient } from '@supabase/ssr'

// This client runs in the browser. It uses the ANON key (safe to expose).
// Tokens are stored in httpOnly cookies set by our server, not in localStorage.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
