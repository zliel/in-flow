import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: RouteComponent,
  loader: ({ context }) => {
    return { userId: context.userId }
  },
})

function RouteComponent() {
  const userId = Route.useRouteContext().userId
  return <div className="flex items-center justify-center">Hello, {userId}</div>
}
