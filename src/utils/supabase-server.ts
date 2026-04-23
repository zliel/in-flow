import { auth } from '@clerk/tanstack-react-start/server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from '@tanstack/react-router'

export async function createServerSupabase() {
  const { isAuthenticated, getToken } = await auth()

  if (!isAuthenticated) {
    throw redirect({ to: '/sign-in/$' })
  }

  const token = await getToken()

  return createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
