import { format, isToday } from 'date-fns'

interface DayHeaderRowProps {
  days: Date[]
}

export default function DayHeaderRow({ days }: DayHeaderRowProps) {
  return (
    <thead>
      <tr>
        <th
          className="sticky top-0 left-0 z-30 w-15 bg-(--background-elevated) p-0 border-r border-border"
          style={{ height: 60 }}
        />
        {days.map((day) => (
          <th
            key={day.toISOString()}
            className="sticky top-0 z-20 bg-(--background-elevated) p-0 border-r border-border"
            style={{ height: 60 }}
          >
            <div className="flex h-full flex-col items-center justify-center">
              <span className="text-xs font-medium uppercase tracking-wider text-(--text-muted)">
                {format(day, 'EEE')}
              </span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-base font-semibold ${
                  isToday(day)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-(--text)'
                }`}
              >
                {format(day, 'd')}
              </span>
            </div>
          </th>
        ))}
      </tr>
    </thead>
  )
}
