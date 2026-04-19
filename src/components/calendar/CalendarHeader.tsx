import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameMonth,
  eachDayOfInterval,
  getDay,
  addDays,
} from 'date-fns'

type ViewMode = 'month' | 'week' | 'day'

// WARN: None of the rest of the calendar has access to this state, so the view for it doesn't change.
// Maybe we should lift this state up to the parent component and pass it down as a prop?
export default function CalendarHeader() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')

  const navigatePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(subWeeks(currentDate, 1))
    }
  }

  const navigateNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      setCurrentDate(addWeeks(currentDate, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getTitle = () => {
    if (viewMode === 'month') {
      return format(currentDate, 'MMMM yyyy')
    }
    const start = startOfWeek(currentDate, { weekStartsOn: 0 })
    const end = endOfWeek(currentDate, { weekStartsOn: 0 })
    if (isSameMonth(start, end)) {
      return format(start, 'MMMM yyyy')
    }
    return `${format(start, 'MMM')} - ${format(end, 'MMM yyyy')}`
  }

  return (
    <header className="sticky top-0 z-40 flex flex-col gap-3 border-b border-border bg-(--background-elevated)/95 px-4 py-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition hover:bg-(--primary)/20"
        >
          <CalendarDays className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={navigatePrev}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={navigateNext}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-xl font-semibold tracking-tight">{getTitle()}</h2>
        <Button
          variant="ghost"
          onClick={goToToday}
          className="hidden text-sm font-medium sm:inline-flex"
        >
          Today
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-xl border border-border p-1">
          <button
            onClick={() => setViewMode('day')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              viewMode === 'day'
                ? 'bg-primary text-primary-foreground'
                : 'text-(--text-muted) hover:text-(--text)'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              viewMode === 'week'
                ? 'bg-primary text-primary-foreground'
                : 'text-(--text-muted) hover:text-(--text)'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              viewMode === 'month'
                ? 'bg-primary text-primary-foreground'
                : 'text-(--text-muted) hover:text-(--text)'
            }`}
          >
            Month
          </button>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Event</span>
        </Button>
      </div>
    </header>
  )
}

export function getWeekDays(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  const end = endOfWeek(date, { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
}

export function getMonthDays(date: Date) {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  const firstDay = getDay(start)
  const lastDay = getDay(end)
  const startDate = addDays(start, -firstDay)
  const endDate = addDays(end, 6 - lastDay)
  return eachDayOfInterval({ start: startDate, end: endDate })
}
