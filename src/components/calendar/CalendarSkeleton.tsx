import { cn } from '#/lib/utils'

interface CalendarSkeletonProps {
  viewMode: 'day' | 'week' | 'month'
}

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-(--border)',
        className,
      )}
    />
  )
}

export function WeekSkeleton() {
  return (
    <div className="h-[calc(100vh-120px)] overflow-auto p-4">
      {/* Header row */}
      <div className="mb-2 flex gap-2">
        {Array.from({ length: 8 }, (_, i) => (
          <Pulse
            key={i}
            className={cn(
              'h-14 flex-1 rounded-lg',
              i === 0 ? 'w-12 flex-none' : '',
            )}
          />
        ))}
      </div>
      {/* Hour rows */}
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="flex gap-2 border-t border-(--border) py-2">
          <Pulse className="h-4 w-12 flex-none" />
          {Array.from({ length: 7 }, (_, j) => (
            <Pulse key={j} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function MonthSkeleton() {
  return (
    <div className="h-[calc(100vh-120px)] overflow-auto p-4">
      {/* Day header row */}
      <div className="mb-2 grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }, (_, i) => (
          <Pulse key={i} className="h-6 rounded" />
        ))}
      </div>
      {/* Week rows */}
      {Array.from({ length: 5 }, (_, w) => (
        <div key={w} className="grid grid-cols-7 gap-2 border-t border-(--border) py-3">
          {Array.from({ length: 7 }, (_, d) => (
            <div key={d} className="flex flex-col gap-1">
              <Pulse className="mb-1 h-5 w-5 rounded-full" />
              <Pulse className="h-3 w-full rounded" />
              <Pulse className="h-3 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function DaySkeleton() {
  return (
    <div className="h-[calc(100vh-120px)] overflow-auto p-4">
      {/* Header */}
      <Pulse className="mb-2 h-14 w-full rounded-lg" />
      {/* Hour rows */}
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="flex gap-2 border-t border-(--border) py-2">
          <Pulse className="h-4 w-12 flex-none" />
          <Pulse className="h-12 flex-1" />
        </div>
      ))}
    </div>
  )
}
