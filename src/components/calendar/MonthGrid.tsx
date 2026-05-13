import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, isSameDay, startOfDay, endOfDay, isSameMonth } from 'date-fns'
import type { Block } from '#/types'
import { getMonthDays } from './CalendarHeader'
import { useCalendar } from './CalendarContext'
import { getBlocksAndBlockTypes } from '@/utils/server-blocks'
import { getContrastColors } from '#/utils/color'

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function MonthGrid() {
  const { currentDate, setSelectedBlock, setIsAddEventOpen, setCurrentDate } =
    useCalendar()
  const monthDays = useMemo(() => getMonthDays(currentDate), [currentDate])

  const { data } = useQuery({
    queryKey: ['blocks', format(currentDate, 'yyyy-MM')],
    queryFn: async () => await getBlocksAndBlockTypes(),
  })

  const blockTypes = data?.blockTypes ?? []
  const blocks = data?.blocks ?? []

  const monthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  )
  const monthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  )

  const filteredBlocks = useMemo(() => {
    return blocks.filter((b) => {
      if (b.is_recurring) return false
      const blockDate = new Date(b.start_time)
      return (
        blockDate >= startOfDay(monthStart) && blockDate <= endOfDay(monthEnd)
      )
    })
  }, [blocks, monthStart, monthEnd])

  const handleEventClick = (block: Block) => {
    setSelectedBlock(block)
    setIsAddEventOpen(true)
  }

  const handleDayClick = (day: Date) => {
    setCurrentDate(day)
    // Note: viewMode switching could be added here if desired
  }

  const getBlockColor = (blockTypeId: string | null) => {
    if (!blockTypeId) return 'var(--primary)'
    const bt = blockTypes.find((t) => t.id === blockTypeId)
    return bt?.color || 'var(--primary)'
  }

  // Split month days into weeks
  const weeks: Date[][] = []
  for (let i = 0; i < monthDays.length; i += 7) {
    weeks.push(monthDays.slice(i, i + 7))
  }

  return (
    <div className="h-[calc(100vh-120px)] overflow-auto p-2 sm:p-4">
      <div className="h-full min-w-[320px] rounded-xl border border-border bg-(--background-elevated)">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="flex items-center justify-center border-r border-border py-3 last:border-r-0"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-(--text-muted)">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex flex-col">
          {weeks.map((week, weekIdx) => (
            <div
              key={weekIdx}
              className="grid flex-1 grid-cols-7 border-b border-border last:border-b-0"
            >
              {week.map((day) => {
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isToday = isSameDay(day, new Date())
                const dayBlocks = filteredBlocks.filter((b) =>
                  isSameDay(new Date(b.start_time), day),
                )

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day)}
                    className={`group relative min-h-[80px] cursor-pointer border-r border-border p-1 transition sm:min-h-[100px] sm:p-2 last:border-r-0 ${
                      isCurrentMonth ? '' : 'opacity-40'
                    } hover:bg-(--primary)/5`}
                  >
                    {/* Day number */}
                    <div
                      className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday
                          ? 'bg-primary text-primary-foreground'
                          : 'text-(--text)'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>

                    {/* Events */}
                    <div className="flex flex-col gap-0.5">
                      {dayBlocks.slice(0, 3).map((block) => {
                        const blockColor = getBlockColor(block.block_type_id)
                        const contrast = getContrastColors(blockColor)
                        return (
                          <div
                            key={block.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEventClick(block)
                            }}
                            className={`truncate rounded px-1 py-0.5 text-[10px] font-medium sm:text-xs ${contrast.textClass}`}
                            style={{
                              backgroundColor: blockColor,
                            }}
                            title={block.title || 'Untitled'}
                          >
                            {block.title || 'Untitled'}
                          </div>
                        )
                      })}
                      {dayBlocks.length > 3 && (
                        <span className="text-[10px] font-medium text-(--text-muted) sm:text-xs">
                          +{dayBlocks.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
