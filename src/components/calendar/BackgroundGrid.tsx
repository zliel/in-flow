import { format, isSameDay } from 'date-fns'
import type { Block, BlockType } from '#/types'
import { computeEventLanes } from '#/utils/calendar'
import type { EventLane } from '#/utils/calendar'
import { HugeiconsIcon } from '@hugeicons/react'
import { EnergyIcon } from '@hugeicons/core-free-icons'
import { getContrastColors } from '#/utils/color'
import DraggableEvent from './DraggableEvent'
import DroppableHourSlot from './DroppableHourSlot'

export function EventContent({
  block,
  blockTypeMap,
}: {
  block: Block
  blockTypeMap: Map<string, BlockType>
}) {
  const blockType = block.block_type_id
    ? blockTypeMap.get(block.block_type_id)
    : undefined
  const color = blockType?.color || 'var(--primary)'
  const energyRequired = blockType?.default_energy_required ?? null
  const contrast = getContrastColors(color)
  const start = new Date(block.start_time)
  const end = new Date(block.end_time)

  return (
    <div className="flex h-full flex-col gap-0.5 overflow-hidden">
      <div className="flex items-start justify-between gap-1">
        <p className={`truncate text-xs font-semibold ${contrast.textClass}`}>
          {block.title || 'Untitled'}
        </p>
        {energyRequired !== null && (
          <span
            className={`inline-flex shrink-0 items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium leading-none ${contrast.badgeClass}`}
          >
            <HugeiconsIcon icon={EnergyIcon} strokeWidth={2} size={12} />
            <span>{energyRequired}</span>
          </span>
        )}
      </div>
      <p className={`truncate text-[10px] ${contrast.mutedTextClass}`}>
        {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
      </p>
    </div>
  )
}

interface BackgroundGridProps {
  days: Date[]
  blockTypes: Map<string, BlockType>
  filteredBlocks: Block[]
  hourHeight?: number
  onEventClick?: (block: Block) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DEFAULT_HOUR_HEIGHT = 80

export default function BackgroundGrid({
  days,
  blockTypes: blockTypeMap,
  filteredBlocks,
  hourHeight = DEFAULT_HOUR_HEIGHT,
  onEventClick,
}: BackgroundGridProps) {
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
              <DroppableHourSlot
                key={`${day.toISOString()}-${hour}`}
                id={`slot-${format(day, 'yyyy-MM-dd')}-${hour}`}
                data={{
                  day: format(day, 'yyyy-MM-dd'),
                  hour,
                }}
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
                    const blockType = block.block_type_id
                      ? blockTypeMap.get(block.block_type_id)
                      : undefined
                    const color = blockType?.color || 'var(--primary)'
                    const laneData: EventLane | undefined = laneMap.get(
                      block.id,
                    )
                    const lane = laneData?.lane ?? 0
                    const totalLanes = laneData?.totalLanes ?? 1
                    const widthPercent = 100 / totalLanes
                    const leftPercent = lane * widthPercent

                    return (
                      <DraggableEvent
                        key={block.id}
                        id={block.id}
                        data={{
                          blockId: block.id,
                          startHour: start.getHours(),
                          startMinute: start.getMinutes(),
                          durationMinutes:
                            (end.getTime() - start.getTime()) / 60000,
                        }}
                      >
                        <div
                          className="absolute inset-x-1 select-none rounded-lg px-2 py-1 hover:scale-[1.02] hover:shadow-lg"
                          style={{
                            top: `${(start.getMinutes() / 60) * hourHeight}px`,
                            height: `${Math.max(duration, 24)}px`,
                            width: `${widthPercent - 2}%`,
                            left: `${leftPercent + 1}%`,
                            backgroundColor: color,
                            borderLeft: `3px solid ${color}`,
                            zIndex: 10,
                          }}
                          onClick={(e) => handleEventClick(block, e)}
                        >
                          <EventContent
                            block={block}
                            blockTypeMap={blockTypeMap}
                          />
                        </div>
                      </DraggableEvent>
                    )
                  })}
              </DroppableHourSlot>
            )
          })}
        </tr>
      ))}
    </tbody>
  )
}
