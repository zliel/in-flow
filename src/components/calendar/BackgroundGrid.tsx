import { format, isSameDay } from 'date-fns'
import type { Block, BlockType } from '#/types'

interface BackgroundGridProps {
  days: Date[]
  blocks: Block[]
  blockTypes: BlockType[]
  filteredBlocks: Block[]
  hourHeight?: number
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DEFAULT_HOUR_HEIGHT = 60

export default function BackgroundGrid({
  days,
  blocks,
  blockTypes,
  filteredBlocks,
  hourHeight = DEFAULT_HOUR_HEIGHT,
}: BackgroundGridProps) {
  const getBlockColor = (blockTypeId: string | null) => {
    if (!blockTypeId) return 'var(--primary)'
    const bt = blockTypes.find((t) => t.id === blockTypeId)
    return bt?.color || 'var(--primary)'
  }

  return (
    <tbody>
      {HOURS.map((hour) => (
        <tr key={hour} className="calendar-row">
          <td
            className="sticky left-0 z-10 w-15 bg-(--background-elevated) p-0"
            style={{ height: hourHeight }}
          >
            <div
              className="flex h-15 w-15 items-center justify-end border-t pr-2"
              style={{ height: hourHeight }}
            >
              <span className="-mt-2 text-xs font-medium text-(--text-muted)">
                {/* using format() from date-fns to convert 24h to 12h format */}
                {format(new Date().setHours(hour, 0, 0, 0), 'h aaaa')}
              </span>
            </div>
          </td>
          {days.map((day) => (
            <td
              key={`${day.toISOString()}-${hour}`}
              className="relative border-t border-l border-border p-0"
              style={{ height: hourHeight }}
            >
              {filteredBlocks
                .filter((b) => {
                  const bStart = new Date(b.start_time)
                  return isSameDay(bStart, day) && bStart.getHours() === hour
                })
                .map((block) => {
                  const start = new Date(block.start_time)
                  const end = new Date(block.end_time)
                  const duration =
                    (end.getHours() - start.getHours()) * hourHeight +
                    ((end.getMinutes() - start.getMinutes()) / 60) * hourHeight
                  const color = getBlockColor(block.block_type_id)

                  return (
                    <div
                      key={block.id}
                      className="absolute left-1 right-1 cursor-pointer rounded-lg px-2 py-1 transition hover:scale-[1.02] hover:shadow-lg"
                      style={{
                        top: `${(start.getMinutes() / 60) * hourHeight}px`,
                        height: `${Math.max(duration, 24)}px`,
                        backgroundColor: color,
                        borderLeft: `3px solid ${color}`,
                      }}
                    >
                      <p className="truncate text-xs font-semibold text-white">
                        {block.title || 'Untitled'}
                      </p>
                      <p className="truncate text-[10px] text-white/80">
                        {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
                      </p>
                    </div>
                  )
                })}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}
