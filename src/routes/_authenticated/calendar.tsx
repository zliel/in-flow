import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import CalendarHeader from '#/components/calendar/CalendarHeader'
import WeekGrid from '#/components/calendar/WeeklyGrid'
import AddEventDialog from '#/components/calendar/AddEventDialog'
import { CalendarProvider } from '#/components/calendar/CalendarContext'
import { getBlocksAndBlockTypes } from '@/utils/server-blocks'

export const Route = createFileRoute('/_authenticated/calendar')({
  component: RouteComponent,
})

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
          <WeekGrid />
        </div>
      </main>
      <AddEventDialog blockTypes={blockTypes} />
    </CalendarProvider>
  )
}
