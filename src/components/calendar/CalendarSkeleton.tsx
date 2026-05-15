import { cn } from '#/lib/utils'

function Pulse({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-(--border)', className)} />
  )
}

export function WeekSkeleton() {
  const HOURS_SKELETON = [
    '6a',
    '7a',
    '8a',
    '9a',
    '10a',
    '11a',
    '12p',
    '1p',
    '2p',
    '3p',
    '4p',
    '5p',
  ]
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="h-[calc(100vh-120px)] overflow-auto p-4">
      <div className="animate-pulse">
        {/* Day header row */}
        <div className="mb-0 flex border-b border-(--border)">
          <div className="w-15 shrink-0" />
          {DAYS.map((day, i) => (
            <div
              key={day}
              className="flex flex-1 items-center justify-center py-3"
            >
              <div className="h-4 w-10 rounded bg-(--border)" />
              <div className="ml-1 h-6 w-6 rounded-full bg-(--border)" />
            </div>
          ))}
        </div>

        {/* Hour rows */}
        {HOURS_SKELETON.map((_, i) => (
          <div
            key={i}
            className="flex border-b border-(--border)"
            style={{ height: 80 }}
          >
            <div className="flex w-15 shrink-0 items-start justify-center pt-2">
              <div className="h-3 w-8 rounded bg-(--border)" />
            </div>
            {Array.from({ length: 7 }, (_, j) => (
              <div
                key={j}
                className="relative flex-1 border-l border-(--border)"
              >
                {/* Scattered event placeholders */}
                {i % 3 === 0 && j % 2 === 0 && (
                  <div
                    className="absolute left-1 right-1 rounded-lg bg-(--border)"
                    style={{
                      height: i % 2 === 0 ? '45px' : '28px',
                      top: '4px',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
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
        <div
          key={w}
          className="grid grid-cols-7 gap-2 border-t border-(--border) py-3"
        >
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
  const HOURS_SKELETON = [
    '6a',
    '7a',
    '8a',
    '9a',
    '10a',
    '11a',
    '12p',
    '1p',
    '2p',
    '3p',
    '4p',
    '5p',
  ]

  return (
    <div className="h-[calc(100vh-120px)] overflow-auto p-4">
      <div className="animate-pulse">
        {/* Day header */}
        <div className="flex items-center justify-center border-b border-(--border) py-3">
          <div className="h-4 w-12 rounded bg-(--border)" />
          <div className="ml-2 h-7 w-7 rounded-full bg-(--border)" />
        </div>

        {/* Hour rows */}
        {HOURS_SKELETON.map((_, i) => (
          <div
            key={i}
            className="flex border-b border-(--border)"
            style={{ height: 80 }}
          >
            <div className="flex w-15 shrink-0 items-start justify-center pt-2">
              <div className="h-3 w-8 rounded bg-(--border)" />
            </div>
            <div className="relative flex-1 border-l border-(--border)">
              {/* Scattered event placeholders */}
              {(i === 2 || i === 4 || i === 7) && (
                <div
                  className="absolute left-1 right-1 rounded-lg bg-(--border)"
                  style={{
                    height: i === 4 ? '120px' : '45px',
                    top: '4px',
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
