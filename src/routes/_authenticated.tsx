import { createFileRoute, Outlet } from '@tanstack/react-router'

import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { redirect } from "@tanstack/react-router"

const requireAuth = createServerFn().handler(async () => {
  const { isAuthenticated, userId } = await auth()

  if (!isAuthenticated) {
    throw redirect({
      to: '/sign-in/$',
    })
  }

  return { userId }
})

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => await requireAuth(),
  component: () => <Outlet />,
})
