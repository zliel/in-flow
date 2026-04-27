import { format, isSameDay } from 'date-fns'
import type { Block, BlockType } from '#/types'
import { computeEventLanes } from '#/utils/calendar'
import type { EventLane } from '#/utils/calendar'
import { HugeiconsIcon } from '@hugeicons/react'
import { EnergyIcon } from '@hugeicons/core-free-icons'

interface BackgroundGridProps {
  days: Date[]
  blockTypes: BlockType[]
  filteredBlocks: Block[]
  hourHeight?: number
  onEventClick?: (block: Block) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DEFAULT_HOUR_HEIGHT = 80

export default function BackgroundGrid({
  days,
  blockTypes,
  filteredBlocks,
  hourHeight = DEFAULT_HOUR_HEIGHT,
  onEventClick,
}: BackgroundGridProps) {
  const getBlockColor = (blockTypeId: string | null) => {
    if (!blockTypeId) return 'var(--primary)'
    const bt = blockTypes.find((t) => t.id === blockTypeId)
    return bt?.color || 'var(--primary)'
  }

  const getEnergyRequired = (blockTypeId: string | null): number | null => {
    if (!blockTypeId) return null
    const bt = blockTypes.find((t) => t.id === blockTypeId)
    return bt?.default_energy_required ?? null
  }

  const handleEventClick = (block: Block, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventClick?.(block)
  }

  const dayColumnBlocks = days.map((day) => ({
    day,
    blocks: filteredBlocks.filter((b) =>
      isSameDay(new Date(b.start_time), day),
    ),
  }))

  return (
    <tbody>
      {HOURS.map((hour) => (
        <tr key={hour} className="calendar-row">
          <td
            className="sticky left-0 z-10 w-15 bg-(--background-elevated) p-0"
            style={{ height: hourHeight }}
          >
            <div
              className="flex h-15 w-12 sm:w-15 items-center justify-center sm:justify-end border-t sm:pr-2"
              style={{ height: hourHeight }}
            >
              <span className="-mt-2 text-xs font-medium text-(--text-muted)">
                {format(new Date().setHours(hour, 0, 0, 0), 'h aaaa')}
              </span>
            </div>
          </td>
          {days.map((day, dayIdx) => {
            const { blocks: dayBlocks } = dayColumnBlocks[dayIdx]
            const laneMap = computeEventLanes(dayBlocks, day)

            return (
              <td
                key={`${day.toISOString()}-${hour}`}
                className="relative border-t border-l border-border p-0"
                style={{ height: hourHeight }}
              >
                {dayBlocks
                  .filter((b) => new Date(b.start_time).getHours() === hour)
                  .map((block) => {
                    const start = new Date(block.start_time)
                    const end = new Date(block.end_time)
                    const duration =
                      (end.getHours() - start.getHours()) * hourHeight +
                      ((end.getMinutes() - start.getMinutes()) / 60) *
                        hourHeight
                    const color = getBlockColor(block.block_type_id)
                    const laneData: EventLane | undefined = laneMap.get(
                      block.id,
                    )
                    const lane = laneData?.lane ?? 0
                    const totalLanes = laneData?.totalLanes ?? 1
                    const widthPercent = 100 / totalLanes
                    const leftPercent = lane * widthPercent

                    const energyRequired = getEnergyRequired(
                      block.block_type_id,
                    )
                    return (
                      <div
                        key={block.id}
                        className="absolute inset-x-1 cursor-pointer select-none rounded-lg px-2 py-1 hover:scale-[1.02] hover:shadow-lg"
                        style={{
                          top: `${(start.getMinutes() / 60) * hourHeight}px`,
                          height: `${Math.max(duration, 24)}px`,
                          width: `${widthPercent - 2}%`,
                          left: `${leftPercent + 1}%`,
                          backgroundColor: color,
                          borderLeft: `3px solid ${color}`,
                          zIndex: 10,
                          transition:
                            'background-color 500ms ease-in-out, border-color 500ms ease-in-out, box-shadow 200ms, scale 200ms ease-in-out, height 200ms ease-in-out',
                        }}
                        onClick={(e) => handleEventClick(block, e)}
                      >
                        <p className="truncate text-xs font-semibold text-white">
                          {block.title || 'Untitled'}
                        </p>
                        <p className="truncate text-[10px] text-white/80">
                          {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
                        </p>
                        {energyRequired !== null && (
                          <>
                            <span className="inline-flex items-center rounded-full bg-white/20 px-1.5 py-0.5 font-medium text-white/90">
                              <HugeiconsIcon
                                icon={EnergyIcon}
                                strokeWidth={2}
                                size={18}
                                className="mr-0.5"
                              />
                              {energyRequired}
                            </span>
                          </>
                        )}
                      </div>
                    )
                  })}
              </td>
            )
          })}
        </tr>
      ))}
    </tbody>
  )
}
