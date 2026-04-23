'use client'

import * as React from 'react'
import { format, setHours, setMinutes } from 'date-fns'

import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { HugeiconsIcon } from '@hugeicons/react'
import { CalendarIcon } from '@hugeicons/core-free-icons'

interface DateTimePickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  id?: string
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  label,
  id,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date(value))
  const [hours, setHoursValue] = React.useState(() => {
    const date = new Date(value)
    return date.getHours()
  })
  const [minutes, setMinutesValue] = React.useState(() => {
    const date = new Date(value)
    return date.getMinutes()
  })

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  const handleTimeChange = () => {
    const newDate = setMinutes(setHours(selectedDate, hours), minutes)
    onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"))
    setOpen(false)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      const newDate = setMinutes(setHours(selectedDate, hours), minutes)
      onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"))
    }
    setOpen(isOpen)
  }

  const displayValue = React.useMemo(() => {
    const date = new Date(value)
    return format(date, "MMM d, yyyy 'at' h:mm a")
  }, [value])

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              'w-full justify-start font-normal hover:bg-input/50 hover:border-input',
              !value && 'text-muted-foreground',
            )}
          >
            <HugeiconsIcon
              icon={CalendarIcon}
              strokeWidth={2}
              className="mr-1 size-4 text-muted-foreground"
            />
            {displayValue}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col gap-3 p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-xl"
            />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <select
                  value={hours}
                  onChange={(e) => setHoursValue(Number(e.target.value))}
                  className="rounded-lg border border-input bg-input/30 px-2 py-1.5 text-sm transition-colors outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span className="text-muted-foreground">:</span>
                <select
                  value={minutes}
                  onChange={(e) => setMinutesValue(Number(e.target.value))}
                  className="rounded-lg border border-input bg-input/30 px-2 py-1.5 text-sm transition-colors outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50"
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              <Button size="sm" className="ml-auto" onClick={handleTimeChange}>
                Confirm
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
