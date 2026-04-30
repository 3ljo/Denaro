import { createClient } from '@supabase/supabase-js'

// Server-only admin client backed by the service-role key.
// NEVER import this from a Client Component, route handler exposed to the
// browser, or any path that reaches the bundle. Server Actions only.
//
// Required env: SUPABASE_SERVICE_ROLE_KEY (Project Settings → API).
// Returns null if the env var is missing so callers can surface a friendly
// error instead of a 500 page.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) return null

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
