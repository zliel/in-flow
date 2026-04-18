import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Calendar, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Trigger entrance animations
    const timer = setTimeout(() => setIsLoaded(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const features = [
    {
      icon: Calendar,
      title: 'Weekly Planning',
      description:
        'Plan recurring blocks once, let them repeat every week. See your entire schedule at a glance.',
    },
    {
      icon: Zap,
      title: 'Energy Alignment',
      description:
        "Rate your energy each evening (1-5). InFlow shows you where your schedule didn't match what you had to give.",
    },
  ] as const

  return (
    <main className="page-wrap px-4 pb-16 pt-10">
      {/* Full-width wave background */}
      <div
        className="wave-bg pointer-events-none absolute left-0 right-0 overflow-hidden"
        style={{
          height: '520px',
          zIndex: -1,
          maskImage:
            'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
        }}
        aria-hidden="true"
      >
        {/* SVG Wave Layer 1 - Full bleed from top, waves at bottom */}
        <motion.svg
          className="absolute left-0 w-[300%]"
          style={{ height: '100%' }}
          viewBox="0 0 2160 400"
          preserveAspectRatio="none"
          animate={{
            x: ['0%', '-33.33%'],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'linear',
          }}
        >
          <defs>
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--wave-1-start)" />
              <stop offset="100%" stopColor="var(--wave-1-end)" />
            </linearGradient>
          </defs>
          {/* Wave pattern: starts at y=0, waves in the middle, extends to bottom */}
          <path
            fill="url(#waveGrad1)"
            d="M0,0 L0,140 C120,120,240,100,360,120 C480,140,600,160,720,140 C840,120,960,100,1080,120 C1200,140,1320,160,1440,140 C1560,120,1680,100,1800,120 C1920,140,2040,160,2160,140 L2160,400 L0,400 Z"
          />
        </motion.svg>

        {/* SVG Wave Layer 2 */}
        <motion.svg
          className="absolute left-0 w-[300%]"
          style={{ height: '100%', top: '0px' }}
          viewBox="0 0 2160 400"
          preserveAspectRatio="none"
          animate={{
            x: ['-33.33%', '0%'],
          }}
          transition={{
            duration: 11,
            delay: 0,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        >
          <defs>
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--wave-2-start)" />
              <stop offset="100%" stopColor="var(--wave-2-end)" />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGrad2)"
            d="M0,0 L0,150 C90,130,180,110,270,130 C360,150,450,170,540,150 C630,130,720,110,810,130 C900,150,990,170,1080,150 C1170,130,1260,110,1350,130 C1440,150,1530,170,1620,150 C1710,130,1800,110,1890,130 C1980,150,2070,170,2160,150 L2160,400 L0,400 Z"
          />
        </motion.svg>

        {/* SVG Wave Layer 3 */}
        <motion.svg
          className="absolute left-0 w-[300%]"
          style={{ height: '100%', top: '0px' }}
          viewBox="0 0 2160 400"
          preserveAspectRatio="none"
          animate={{
            x: ['0%', '-33.33%'],
          }}
          transition={{
            duration: 17,
            delay: 0,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'linear',
          }}
        >
          <defs>
            <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--wave-3-start)" />
              <stop offset="100%" stopColor="var(--wave-3-end)" />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGrad3)"
            d="M0,0 L0,145 C75,125,150,105,225,125 C300,145,375,165,450,145 C525,125,600,105,675,125 C750,145,825,165,900,145 C975,125,1050,105,1125,125 C1200,145,1275,165,1350,145 C1425,125,1500,105,1575,125 C1650,145,1725,165,1800,145 C1875,125,1950,105,2025,125 C2100,145,2160,160,2160,160 L2160,400 L0,400 Z"
          />
        </motion.svg>

        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 100%, var(--wave-glow), transparent 70%)`,
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2rem] py-8 sm:py-12">
        <div className="relative">
          <h1
            className={`mb-6 max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight text-(--text) transition-all sm:text-6xl md:text-7xl ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
            style={{
              transitionDuration: '800ms',
              transitionDelay: '100ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            Work when you're wired.
          </h1>
          <p
            className={`mb-12 max-w-xl text-xl leading-relaxed text-(--text-muted) transition-all ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
            style={{
              transitionDuration: '800ms',
              transitionDelay: '250ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            InFlow reveals where your schedule doesn't match your energy.
          </p>
          <Button
            asChild
            size="lg"
            className={`group ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} text-primary-foreground! align-center justify-center`}
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
              transition:
                'opacity 800ms cubic-bezier(0.16, 1, 0.3, 1), transform 800ms cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: '400ms',
            }}
          >
            <Link to="/about">
              Start Planning
              <ArrowRight
                data-icon="inline-end"
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="mt-10 flex flex-col gap-5 sm:flex-row">
        {features.map((feature, index) => (
          <Card
            key={feature.title}
            className={`feature-card group flex-1 p-7 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{
              transition: `opacity 800ms cubic-bezier(0.16, 1, 0.3, 1)`,
              transitionDelay: `${index * 120 + 550}ms`,
            }}
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-semibold">{feature.title}</h2>
            </div>

            <p className="m-0 text-base leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </Card>
        ))}
      </section>
    </main>
  )
}
