import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Block } from '#/types'

export type ViewMode = 'month' | 'week' | 'day'

interface CalendarContextType {
  currentDate: Date
  setCurrentDate: (date: Date) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  isAddEventOpen: boolean
  setIsAddEventOpen: (open: boolean) => void
  selectedBlock: Block | null
  setSelectedBlock: (block: Block | null) => void
}

const CalendarContext = createContext<CalendarContextType | null>(null)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)

  return (
    <CalendarContext.Provider
      value={{
        currentDate,
        setCurrentDate,
        viewMode,
        setViewMode,
        isAddEventOpen,
        setIsAddEventOpen,
        selectedBlock,
        setSelectedBlock,
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error('useCalendar must be used within CalendarProvider')
  }
  return context
}
