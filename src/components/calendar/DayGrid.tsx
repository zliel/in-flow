import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { startOfDay, endOfDay, format } from 'date-fns'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import type { Block, BlockType } from '#/types'
import { useServerFn } from '@tanstack/react-start'
import DayHeaderRow from './DayHeaderRow'
import BackgroundGrid, { EventContent } from './BackgroundGrid'
import { useCalendar } from './CalendarContext'
import { getBlocksAndBlockTypes, updateBlock } from '@/utils/server-blocks'
import { DaySkeleton } from './CalendarSkeleton'

export default function DayGrid() {
  const {
    currentDate,
    setSelectedBlock,
    setIsAddEventOpen,
    draggedBlock,
    setDraggedBlock,
    setDragOverHour,
  } = useCalendar()
  const dayArray = useMemo(() => [currentDate], [currentDate])

  const start = startOfDay(currentDate)
  const end = endOfDay(currentDate)

  const { data, isPending } = useQuery({
    queryKey: ['blocks', format(currentDate, 'yyyy-MM-dd')],
    queryFn: async () => await getBlocksAndBlockTypes(),
  })

  const blockTypes = data?.blockTypes ?? []
  const blocks = data?.blocks ?? []

  const blockTypeMap = useMemo(
    () => new Map(blockTypes.map((bt) => [bt.id, bt])),
    [blockTypes],
  )

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

  const queryClient = useQueryClient()
  const updateBlockFn = useServerFn(updateBlock)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const updateBlockMutation = useMutation({
    mutationFn: async ({
      blockId,
      startTime,
      endTime,
    }: {
      blockId: string
      startTime: string
      endTime: string
    }) => {
      return await updateBlockFn({ data: { blockId, startTime, endTime } })
    },
    onMutate: async () => {
      // Cancel in-flight queries to prevent stale data overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['blocks'] })
      return {}
    },
  })

  const handleDragStart = (event: DragStartEvent) => {
    const block = blocks.find((b) => b.id === event.active.id)
    if (block) setDraggedBlock(block)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedBlock(null)
    setDragOverHour(null)
    const { active, over } = event
    if (!over) return
    const overData = over.data.current as
      | { day: string; hour: number }
      | undefined
    if (!overData) return
    const activeData = active.data.current as
      | {
          blockId: string
          startHour: number
          startMinute: number
          durationMinutes: number
        }
      | undefined
    if (!activeData) return
    const block = blocks.find((b) => b.id === activeData.blockId)
    if (!block) return
    const newStart = new Date(
      `${overData.day}T${String(overData.hour).padStart(2, '0')}:${String(activeData.startMinute).padStart(2, '0')}:00`,
    )
    const newEnd = new Date(
      newStart.getTime() + activeData.durationMinutes * 60000,
    )
    const newStartISO = newStart.toISOString()
    const newEndISO = newEnd.toISOString()

    // Snapshot pre-optimistic state for rollback
    const allPrevious = queryClient.getQueriesData({ queryKey: ['blocks'] })

    // Optimistic update: sync cache BEFORE mutation fires (same synchronous batch as
    // setDraggedBlock(null) above — React renders them together, no flash)
    queryClient.setQueriesData({ queryKey: ['blocks'] }, (old: unknown) => {
      if (!old || typeof old !== 'object') return old
      const cached = old as { blocks: Block[]; blockTypes: BlockType[] }
      return {
        ...cached,
        blocks: cached.blocks.map((b: Block) =>
          b.id === activeData.blockId
            ? { ...b, start_time: newStartISO, end_time: newEndISO }
            : b,
        ),
      }
    })

    updateBlockMutation.mutate(
      {
        blockId: activeData.blockId,
        startTime: newStartISO,
        endTime: newEndISO,
      },
      {
        onError: () => {
          // Rollback to pre-optimistic state if the server call fails
          for (const [key, cachedData] of allPrevious) {
            queryClient.setQueryData(key, cachedData)
          }
        },
      },
    )
  }

  if (isPending) {
    return <DaySkeleton />
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-[calc(100vh-120px)] overflow-auto">
        <table className="w-full table-fixed border-collapse">
          <DayHeaderRow days={dayArray} />
          <BackgroundGrid
            days={dayArray}
            blockTypes={blockTypeMap}
            filteredBlocks={filteredBlocks}
            onEventClick={handleEventClick}
          />
        </table>
      </div>
      <DragOverlay dropAnimation={null}>
        {draggedBlock
          ? (() => {
              const blockStart = new Date(draggedBlock.start_time)
              const blockEnd = new Date(draggedBlock.end_time)
              const durationPx = Math.max(
                ((blockEnd.getTime() - blockStart.getTime()) / (1000 * 60 * 60)) * 80,
                24,
              )
              return (
                <div
                  className="rounded-lg px-2 py-1 shadow-xl opacity-90"
                  style={{
                    backgroundColor:
                      blockTypeMap.get(draggedBlock.block_type_id ?? '')
                        ?.color || 'var(--primary)',
                    width: 'calc(100dvw - 8rem)',
                    height: durationPx,
                    maxWidth: '600px',
                  }}
                >
                  <EventContent
                    block={draggedBlock}
                    blockTypeMap={blockTypeMap}
                  />
                </div>
              )
            })()
          : null}
      </DragOverlay>
    </DndContext>
  )
}
