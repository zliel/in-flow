import { isSameDay } from 'date-fns'
import type { Block } from '#/types'

export interface EventLane {
  block: Block
  lane: number
  totalLanes: number
}

export function computeEventLanes(
  dayBlocks: Block[],
  day: Date,
): Map<string, EventLane> {
  const result = new Map<string, EventLane>()

  const relevant = dayBlocks.filter((b) =>
    isSameDay(new Date(b.start_time), day),
  )
  if (relevant.length <= 1) {
    relevant.forEach((block) => {
      result.set(block.id, { block, lane: 0, totalLanes: 1 })
    })
    return result
  }

  const sorted = [...relevant].sort((a, b) => {
    const aStart = new Date(a.start_time).getTime()
    const bStart = new Date(b.start_time).getTime()
    return aStart - bStart
  })

  const lanes: Block[][] = []

  for (const block of sorted) {
    const start = new Date(block.start_time).getTime()

    let placed = false
    for (let i = 0; i < lanes.length; i++) {
      const laneTop = lanes[i]
      const lastInLane = laneTop[laneTop.length - 1]
      const lastEnd = new Date(lastInLane.end_time).getTime()

      if (start >= lastEnd) {
        laneTop.push(block)
        result.set(block.id, { block, lane: i, totalLanes: 0 })
        placed = true
        break
      }
    }

    if (!placed) {
      lanes.push([block])
      result.set(block.id, { block, lane: lanes.length - 1, totalLanes: 0 })
    }
  }

  const maxLanes = lanes.length
  for (const [, laneData] of result) {
    laneData.totalLanes = maxLanes
  }

  return result
}
