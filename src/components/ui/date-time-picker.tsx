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
import { motion } from 'framer-motion'

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

  const hasValue = Boolean(value)

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
              'w-full justify-start gap-2 font-normal transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)]',
              hasValue
                ? 'border-primary/25 bg-primary/[0.04] text-foreground hover:bg-primary/[0.08] hover:border-primary/35'
                : 'text-muted-foreground hover:bg-input/50 hover:border-input',
            )}
          >
            <HugeiconsIcon
              icon={CalendarIcon}
              strokeWidth={2}
              className={cn(
                'size-4 transition-colors duration-180',
                hasValue ? 'text-primary' : 'text-muted-foreground',
              )}
            />
            <span className={cn(hasValue && 'font-medium')}>
              {displayValue}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto rounded-2xl p-0"
          style={{ maxHeight: 'min(60vh, 400px)', overflowY: 'auto' }}
          align="start"
          sideOffset={4}
          collisionPadding={{ top: 16, bottom: 16 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl"
          >
            <div className="flex flex-col gap-4 p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-xl"
              />
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.06,
                  duration: 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <TimeSelect
                      value={hours}
                      onChange={setHoursValue}
                      options={Array.from({ length: 24 }, (_, i) => ({
                        value: i,
                        label: i.toString().padStart(2, '0'),
                      }))}
                    />
                    <span className="font-medium text-muted-foreground">:</span>
                    <TimeSelect
                      value={minutes}
                      onChange={setMinutesValue}
                      options={Array.from({ length: 60 }, (_, i) => ({
                        value: i,
                        label: i.toString().padStart(2, '0'),
                      }))}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={handleTimeChange}>
                  Confirm
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

/**
 * A visually polished native <select> styled to match the shadcn SelectTrigger
 * aesthetic — with rounded corners, focus ring, and a dropdown chevron.
 */
function TimeSelect({
  value,
  onChange,
  options,
}: {
  value: number
  onChange: (v: number) => void
  options: { value: number; label: string }[]
}) {
  return (
    <div className="relative rounded-xl border border-input bg-input/30 transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="appearance-none bg-transparent px-3 py-1.5 pr-7 text-sm outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 6l4 4 4-4" />
      </svg>
    </div>
  )
}
