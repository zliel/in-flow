import { Card } from '@/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'
import { Layers, CalendarDays, Gauge } from 'lucide-react'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  const steps = [
    {
      icon: Layers,
      title: 'Create block types',
      description:
        'Label your task types (Deep Work, Meetings, Admin) and assign each an energy requirement.',
    },
    {
      icon: CalendarDays,
      title: 'Plan your week',
      description: 'Schedule recurring blocks, see everything at a glance.',
    },
    {
      icon: Gauge,
      title: 'Check in daily',
      description:
        'Rate your energy each evening (1-5). InFlow highlights the gaps.',
    },
  ] as const

  return (
    <main className="page-wrap py-12">
      {/* The Problem */}
      <section className="rise-in rounded-2xl py-6 sm:py-10">
        <p className="eyebrow mb-3">The Problem</p>
        <h1 className="display-title mb-5 text-3xl font-bold leading-tight text-(--text) sm:text-4xl md:text-5xl">
          Calendars treat every hour equally. But we're not equally productive
          every hour.
        </h1>
        <h3 className="mb-0 text-xl font-semibold leading-tight text-(--text-muted) sm:text-2xl">
          Tuesday at 10am feels different than Friday at 3pm. But, we schedule
          the same deep work anywhere, and wonder why we burn out.
        </h3>
      </section>

      {/* How It Works */}
      <section
        className="rise-in mt-8 rounded-2xl py-6 sm:py-10"
        style={{ animationDelay: '150ms' }}
      >
        <p className="eyebrow mb-8">How It Works</p>
        <div className="flex flex-col gap-5 sm:flex-row">
          {steps.map((step, _) => (
            <Card
              key={step.title}
              className="group card feature-card flex-1 rounded-2xl p-7"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--primary)/10 text-primary">
                  <step.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <div className="text-lg font-semibold text-(--text)">
                  {step.title}
                </div>
              </div>
              <p className="m-0 leading-relaxed text-(--text-muted)">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section
        className="rise-in mt-8 rounded-2xl py-6 sm:py-10"
        style={{ animationDelay: '300ms' }}
      >
        <p className="eyebrow mb-3">Why?</p>
        <h2 className="display-title mb-0 text-2xl font-bold leading-tight text-(--text) sm:text-3xl">
          The goal isn't to match your schedule perfectly.
        </h2>
        <h3 className="mt-4 text-xl font-semibold leading-tight text-(--text-muted) sm:text-2xl">
          It's to see the patterns: where you're consistently overcommitting,
          which days you overestimate, and when to lock in vs. when to rest.
        </h3>
      </section>
    </main>
  )
}
