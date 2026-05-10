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
import { useCalendar } from './CalendarContext'

export default function CalendarHeader() {
  const {
    currentDate,
    setCurrentDate,
    viewMode,
    setViewMode,
    setIsAddEventOpen,
  } = useCalendar()

  const navigatePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1))
    } else {
      setCurrentDate(addDays(currentDate, -1))
    }
  }

  const navigateNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addDays(currentDate, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getTitle = () => {
    if (viewMode === 'month') {
      return format(currentDate, 'MMMM yyyy')
    } else if (viewMode === 'day') {
      return format(currentDate, 'EEEE, MMMM d, yyyy')
    }
    const start = startOfWeek(currentDate, { weekStartsOn: 0 })
    const end = endOfWeek(currentDate, { weekStartsOn: 0 })
    if (isSameMonth(start, end)) {
      return format(start, 'MMMM yyyy')
    }
    return `${format(start, 'MMM')} - ${format(end, 'MMM yyyy')}`
  }

  const title = getTitle()

  return (
    <header className="sticky top-0 z-40 flex flex-col gap-3 border-b border-border bg-(--background-elevated)/95 px-3 py-2.5 backdrop-blur-md sm:gap-0 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <Link
          to="/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition hover:bg-(--primary)/20 sm:h-10 sm:w-10"
        >
          <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={navigatePrev}
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <h2 className="min-w-[4rem] truncate text-base font-semibold tracking-tight sm:text-xl">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={navigateNext}
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={goToToday}
          className="text-xs font-medium sm:text-sm"
        >
          Today
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2 sm:gap-2">
        <div className="flex rounded-xl border border-border p-0.5 sm:p-1">
          <button
            onClick={() => setViewMode('day')}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
              viewMode === 'day'
                ? 'bg-primary text-primary-foreground'
                : 'text-(--text-muted) hover:text-(--text)'
            }`}
          >
            <span className="sm:hidden">D</span>
            <span className="hidden sm:inline">Day</span>
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
              viewMode === 'week'
                ? 'bg-primary text-primary-foreground'
                : 'text-(--text-muted) hover:text-(--text)'
            }`}
          >
            <span className="sm:hidden">W</span>
            <span className="hidden sm:inline">Week</span>
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
              viewMode === 'month'
                ? 'bg-primary text-primary-foreground'
                : 'text-(--text-muted) hover:text-(--text)'
            }`}
          >
            <span className="sm:hidden">M</span>
            <span className="hidden sm:inline">Month</span>
          </button>
        </div>
        <Button
          size="sm"
          className="gap-1.5 h-8 px-3 sm:gap-2 sm:h-9 sm:px-4"
          onClick={() => setIsAddEventOpen(true)}
        >
          <Plus className="h-4 w-4 sm:h-4 sm:w-4" />
          Add Event
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
