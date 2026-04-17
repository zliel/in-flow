import { useMemo } from 'react'
import { useSession } from '@clerk/tanstack-react-start'
import { createClient } from '@supabase/supabase-js'

export function useSupabase() {
  const { session } = useSession()

  return useMemo(() => {
    return createClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_KEY!,
      {
        async accessToken() {
          return session?.getToken() ?? null
        },
      }
    )
  }, [session])
}
