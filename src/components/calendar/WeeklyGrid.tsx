import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { startOfWeek, endOfWeek, format } from 'date-fns'
import type { Block } from '#/types'
import { getWeekDays } from './CalendarHeader'
import DayHeaderRow from './DayHeaderRow'
import BackgroundGrid from './BackgroundGrid'
import { useCalendar } from './CalendarContext'
import { getBlocksAndBlockTypes } from '@/utils/server-blocks'
import { WeekSkeleton } from './CalendarSkeleton'

export default function WeeklyGrid() {
  const { currentDate, setSelectedBlock, setIsAddEventOpen } = useCalendar()
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate])

  const start = startOfWeek(currentDate, { weekStartsOn: 0 })
  const end = endOfWeek(currentDate, { weekStartsOn: 0 })

  const { data, isPending } = useQuery({
    queryKey: ['blocks', format(currentDate, 'yyyy-MM-dd')],
    queryFn: async () => await getBlocksAndBlockTypes(),
  })

  const blockTypes = data?.blockTypes ?? []
  const blocks = data?.blocks ?? []

  const filteredBlocks = useMemo(() => {
    return blocks.filter((b) => {
      if (b.is_recurring) return false
      const blockDate = new Date(b.start_time)
      return blockDate >= start && blockDate <= end
    })
  }, [blocks, start, end])

  const handleEventClick = (block: Block) => {
    setSelectedBlock(block)
    setIsAddEventOpen(true)
  }

  if (isPending) {
    return <WeekSkeleton />
  }

  return (
    <div className="h-[calc(100vh-120px)] overflow-auto">
      <table className="w-full table-fixed border-collapse">
        <DayHeaderRow days={weekDays} />
        <BackgroundGrid
          days={weekDays}
          blockTypes={blockTypes}
          filteredBlocks={filteredBlocks}
          onEventClick={handleEventClick}
        />
      </table>
    </div>
  )
}
