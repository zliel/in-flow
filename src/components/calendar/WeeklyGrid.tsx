import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { startOfWeek, endOfWeek, format } from 'date-fns'
import { getWeekDays } from './CalendarHeader'
import DayHeaderRow from './DayHeaderRow'
import BackgroundGrid from './BackgroundGrid'
import { getBlocksAndBlockTypes } from '@/utils/server-blocks'

export default function WeeklyGrid() {
  const [currentWeek] = useState(() => new Date())
  const weekDays = useMemo(() => getWeekDays(currentWeek), [currentWeek])

  const start = startOfWeek(currentWeek, { weekStartsOn: 0 })
  const end = endOfWeek(currentWeek, { weekStartsOn: 0 })

  const { data } = useQuery({
    queryKey: ['blocks', format(currentWeek, 'yyyy-MM-dd')],
    queryFn: async () => await getBlocksAndBlockTypes(),
  })

  const blockTypes = data?.blockTypes ?? []
  const blocks = data?.blocks ?? []

  const filteredBlocks = useMemo(() => {
    return blocks.filter((b) => {
      const blockDate = new Date(b.start_time)
      return blockDate >= start && blockDate <= end
    })
  }, [blocks, start, end])

  return (
    <div className="h-[calc(100vh-120px)] overflow-auto">
      <table className="w-full table-fixed border-collapse">
        <DayHeaderRow days={weekDays} />
        <BackgroundGrid
          days={weekDays}
          blocks={blocks}
          blockTypes={blockTypes}
          filteredBlocks={filteredBlocks}
        />
      </table>
    </div>
  )
}
