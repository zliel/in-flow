import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import CalendarHeader from '#/components/calendar/CalendarHeader'
import DayGrid from '#/components/calendar/DayGrid'
import WeekGrid from '#/components/calendar/WeeklyGrid'
import MonthGrid from '#/components/calendar/MonthGrid'
import AddEventDialog from '#/components/calendar/AddEventDialog'
import { CalendarProvider, useCalendar } from '#/components/calendar/CalendarContext'
import { getBlocksAndBlockTypes } from '@/utils/server-blocks'

export const Route = createFileRoute('/_authenticated/calendar')({
  component: RouteComponent,
})

function CalendarView() {
  const { viewMode } = useCalendar()

  return (
    <>
      {viewMode === 'day' && <DayGrid />}
      {viewMode === 'week' && <WeekGrid />}
      {viewMode === 'month' && <MonthGrid />}
    </>
  )
}

function RouteComponent() {
  const { data } = useQuery({
    queryKey: ['blocks'],
    queryFn: async () => await getBlocksAndBlockTypes(),
  })

  const blockTypes = data?.blockTypes ?? []

  return (
    <CalendarProvider>
      <main className="overflow-x-hidden w-full max-w-full flex flex-col">
        <CalendarHeader />
        <div className="calendar-content flex-1 overflow-auto">
          <CalendarView />
        </div>
      </main>
      <AddEventDialog blockTypes={blockTypes} />
    </CalendarProvider>
  )
}
