import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  ArrowRight,
  Zap,
  Activity,
  Sunrise,
  Sun,
  Moon,
  Clock,
} from 'lucide-react'
import {
  format,
  isSameDay,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getHours,
} from 'date-fns'

import { Card, CardHeader, CardTitle, CardContent } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { cn } from '#/lib/utils'
import { getBlocksAndBlockTypes } from '@/utils/server-blocks'
import type { Block, BlockType } from '#/types'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: RouteComponent,
})

function GreetingIcon() {
  const hour = getHours(new Date())
  const Icon = hour < 12 ? Sunrise : hour < 17 ? Sun : Moon
  return (
    <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:size-12">
      <Icon className="size-5 sm:size-6" />
    </div>
  )
}

function getGreeting() {
  const hour = getHours(new Date())
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  delay,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  subtitle?: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group/card"
    >
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_1px_0_var(--border-inner)_inset,0_6px_18px_rgba(61,79,111,0.06)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-y-[-2px] hover:shadow-[0_1px_0_var(--border-inner)_inset,0_12px_28px_rgba(61,79,111,0.1)] sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/8 text-primary sm:size-10">
            <Icon className="size-4 sm:size-5" />
          </div>
        </div>
        <div className="mt-4">
          <p className="font-heading text-2xl font-semibold tracking-tight text-[--text] sm:text-3xl">
            {value}
          </p>
          <p className="mt-0.5 text-xs font-medium tracking-wide text-[--text-muted] uppercase">
            {label}
          </p>
          {subtitle && (
            <p className="mt-1 text-[11px] leading-tight text-[--text-subtle]">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function BlockRow({
  block,
  blockType,
  index,
}: {
  block: Block
  blockType: BlockType | undefined
  index: number
}) {
  const color = blockType?.color ?? 'var(--primary)'
  const startFormatted = format(parseISO(block.start_time), 'h:mm a')
  const endFormatted = format(parseISO(block.end_time), 'h:mm a')

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: 0.2 + index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative flex items-start gap-3 pl-4"
    >
      {/* Timeline line + dot */}
      <div className="absolute left-0 top-2.5 flex flex-col items-center">
        <div
          className="size-2.5 rounded-full ring-2 ring-[--bg-base]"
          style={{ backgroundColor: color }}
        />
        <div className="mt-1 h-full w-px bg-[--border]" />
      </div>

      {/* Time */}
      <div className="min-w-0 flex-1 rounded-xl border border-transparent px-3 py-2.5 transition-all duration-200 group-hover:border-[--border] group-hover:bg-[--background-elevated]/40">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs font-medium text-[--text-muted] tabular-nums">
            {startFormatted}
          </span>
          <ArrowRight className="size-3 shrink-0 text-[--text-subtle]" />
          <span className="shrink-0 text-xs font-medium text-[--text-muted] tabular-nums">
            {endFormatted}
          </span>
        </div>
        <p className="mt-0.5 text-sm font-medium text-[--text]">
          {block.title || blockType?.name || 'Untitled'}
        </p>
      </div>
    </motion.div>
  )
}

function WeekDayPill({
  day,
  count,
  isToday,
}: {
  day: Date
  count: number
  isToday: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200',
        isToday
          ? 'bg-primary/10 font-semibold text-[--primary] ring-1 ring-primary/20'
          : 'text-[--text-muted] hover:bg-[--background-elevated]/40',
      )}
    >
      <span className="flex items-center gap-2">
        <span className="w-8 text-xs font-medium uppercase tracking-wide">
          {format(day, 'EEE')}
        </span>
        <span className="tabular-nums text-xs">{format(day, 'd')}</span>
      </span>
      <span
        className={cn(
          'tabular-nums text-xs',
          count > 0 ? 'font-medium text-[--text]' : 'text-[--text-subtle]',
        )}
      >
        {count > 0 ? `${count} block${count > 1 ? 's' : ''}` : '—'}
      </span>
    </div>
  )
}

function RouteComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['blocks'],
    queryFn: async () => await getBlocksAndBlockTypes(),
  })

  const blocks: Block[] = data?.blocks ?? []
  const blockTypes: BlockType[] = data?.blockTypes ?? []
  const blockTypeMap = new Map(blockTypes.map((bt) => [bt.id, bt]))

  const today = new Date()
  const todayBlocks = blocks
    .filter((b) => isSameDay(parseISO(b.start_time), today))
    .sort(
      (a, b) =>
        parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime(),
    )

  // This week stats
  const weekStart = startOfWeek(today, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 })
  const thisWeekBlocks = blocks.filter((b) => {
    const d = parseISO(b.start_time)
    return d >= weekStart && d <= weekEnd
  })

  // Unique days this week that have blocks
  const daysActiveThisWeek = new Set(
    thisWeekBlocks.map((b) => format(parseISO(b.start_time), 'yyyy-MM-dd')),
  ).size

  // Week preview: next 7 days from week start
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const dayBlockCounts = weekDays.map((day) => ({
    day,
    count: blocks.filter((b) => isSameDay(parseISO(b.start_time), day)).length,
    isToday: isSameDay(day, today),
  }))

  if (isLoading) {
    return (
      <div className="page-wrap py-8 sm:py-10">
        <div className="flex flex-col gap-6 sm:gap-8">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrap py-8 sm:py-10">
      {/* ---------- Welcome ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <GreetingIcon />
          <div>
            <h1 className="font-heading text-xl font-semibold tracking-tight text-[--text] sm:text-2xl">
              {getGreeting()}
            </h1>
            <p className="mt-0.5 text-sm text-[--text-muted]">
              {format(today, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>

        <Link to="/calendar">
          <Button variant="default" size="default" className="h-9 gap-2 px-4">
            <CalendarDays className="size-4" />
            Go to Calendar
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </motion.div>

      {/* ---------- Quick stats ---------- */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Zap}
          label="Blocks This Week"
          value={thisWeekBlocks.length}
          delay={0.1}
        />
        <StatCard
          icon={Activity}
          label="Energy Average"
          value="—"
          subtitle="Check-ins coming soon"
          delay={0.15}
        />
        <StatCard
          icon={CalendarDays}
          label="Days Active"
          value={`${daysActiveThisWeek}/7`}
          subtitle="This week"
          delay={0.2}
        />
      </div>

      {/* ---------- Main content ---------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.25,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4 text-[--primary]" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayBlocks.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {todayBlocks.map((block, i) => (
                    <BlockRow
                      key={block.id}
                      block={block}
                      blockType={
                        block.block_type_id
                          ? blockTypeMap.get(block.block_type_id)
                          : undefined
                      }
                      index={i}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[--background-elevated] ring-1 ring-[--border]">
                    <CalendarDays className="size-6 text-[--text-subtle]" />
                  </div>
                  <p className="font-heading text-base font-medium text-[--text]">
                    A clear day ahead
                  </p>
                  <p className="mt-1 max-w-xs text-sm leading-relaxed text-[--text-muted]">
                    Nothing scheduled yet. Use the calendar to plan your time
                    and align your energy.
                  </p>
                  <Link to="/calendar" className="mt-5">
                    <Button variant="default" size="default" className="gap-2">
                      <CalendarDays className="size-4" />
                      Plan your day
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </Link>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.35,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="size-4 text-[--primary]" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-0.5">
                {dayBlockCounts.map((d) => (
                  <WeekDayPill
                    key={format(d.day, 'yyyy-MM-dd')}
                    day={d.day}
                    count={d.count}
                    isToday={d.isToday}
                  />
                ))}
              </div>

              <div className="mt-6 border-t border-[--border] pt-4">
                <Link to="/calendar">
                  <Button
                    variant="outline"
                    size="default"
                    className="w-full gap-2"
                  >
                    <CalendarDays className="size-4" />
                    Open Calendar
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
