import { createFileRoute } from '@tanstack/react-router'
import CalendarHeader from '#/components/calendar/CalendarHeader'
import WeekGrid from '#/components/calendar/WeeklyGrid'

export const Route = createFileRoute('/_authenticated/calendar')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="overflow-x-hidden w-full max-w-full flex flex-col">
      <CalendarHeader />
      <div className="calendar-content flex-1 overflow-auto">
        <WeekGrid />
      </div>
    </main>
  )
}
