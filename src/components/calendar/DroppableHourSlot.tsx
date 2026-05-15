import { useDroppable } from '@dnd-kit/core'
import type { ReactNode, CSSProperties } from 'react'

interface DroppableHourSlotProps {
  id: string
  data: {
    day: string
    hour: number
  }
  children: ReactNode
  style?: CSSProperties
}

export default function DroppableHourSlot({
  id,
  data,
  children,
  style,
}: DroppableHourSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id, data })

  return (
    <td
      ref={setNodeRef}
      style={style}
      className={`relative border-t border-l border-border p-0 transition-colors ${
        isOver ? 'bg-primary/10' : ''
      }`}
    >
      {children}
    </td>
  )
}
