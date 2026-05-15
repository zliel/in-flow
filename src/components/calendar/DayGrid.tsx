import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { startOfDay, endOfDay, format } from 'date-fns'
import type { Block } from '#/types'
import DayHeaderRow from './DayHeaderRow'
import BackgroundGrid from './BackgroundGrid'
import { useCalendar } from './CalendarContext'
import { getBlocksAndBlockTypes } from '@/utils/server-blocks'
import { DaySkeleton } from './CalendarSkeleton'

export default function DayGrid() {
  const { currentDate, setSelectedBlock, setIsAddEventOpen } = useCalendar()
  const dayArray = useMemo(() => [currentDate], [currentDate])

  const start = startOfDay(currentDate)
  const end = endOfDay(currentDate)

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
    return <DaySkeleton />
  }

  return (
    <div className="h-[calc(100vh-120px)] overflow-auto">
      <table className="w-full table-fixed border-collapse">
        <DayHeaderRow days={dayArray} />
        <BackgroundGrid
          days={dayArray}
          blockTypes={blockTypes}
          filteredBlocks={filteredBlocks}
          onEventClick={handleEventClick}
        />
      </table>
    </div>
  )
}
