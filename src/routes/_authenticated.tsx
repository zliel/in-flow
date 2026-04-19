import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { createClient } from '@supabase/supabase-js'

const requireAuth = createServerFn().handler(async () => {
  const { isAuthenticated, userId, getToken } = await auth()

  if (!isAuthenticated) {
    throw redirect({
      to: '/sign-in/$',
    })
  }

  // TODO: This is fine for now but will need to be moved to be in the loader for a specific page
  // to avoid making this request for every single authenticated page
  const token = await getToken()

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )

  const { count } = await supabase
    .from('block_types')
    .select('*', { count: 'exact', head: true })
    .limit(1)

  if (count === 0) {
    await supabase.rpc('seed_default_block_types', { p_user_id: userId })
  }

  return { userId }
})

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    await context.queryClient.fetchQuery(
      queryOptions({
        queryKey: ['requireAuth'],
        queryFn: () => requireAuth(),
        staleTime: 5 * 60 * 1000,
      }),
    )
  },
  component: () => <Outlet />,
})
