import { useDraggable } from '@dnd-kit/core'
import type { ReactNode } from 'react'

interface DraggableEventProps {
  id: string
  children: ReactNode
  data: {
    blockId: string
    startHour: number
    startMinute: number
    durationMinutes: number
  }
}

export default function DraggableEvent({
  id,
  children,
  data,
}: DraggableEventProps) {
  const { attributes, listeners, setNodeRef, isDragging } =
    useDraggable({ id, data })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing ${
        isDragging ? 'invisible' : ''
      }`}
    >
      {children}
    </div>
  )
}
