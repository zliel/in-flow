import { useState, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { Menu01Icon, Cancel01Icon } from '@hugeicons/core-free-icons'
import ThemeToggle from './ThemeToggle'
import HeaderUser from '@/integrations/clerk/header-user'
import { Show, ClerkLoaded } from '@clerk/tanstack-react-start'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
] as const

const authLinks = [
  { to: '/dashboard', label: 'Dashboard' },
] as const

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  return (
    <header className="sticky top-0 z-50 bg-(--header-bg) backdrop-blur-lg">
      <nav className="page-wrap flex items-center justify-between gap-x-3 py-3 sm:py-4">
        <div className="flex items-center gap-6">
          <h2 className="m-0 text-lg font-semibold tracking-tight">
            <Link
              to="/"
              className="inline-flex items-center text-(--text) no-underline"
            >
              InFlow
            </Link>
          </h2>

          <div className="hidden items-center gap-5 text-sm font-medium sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="nav-link"
                activeProps={{ className: 'nav-link is-active' }}
              >
                {link.label}
              </Link>
            ))}
            <ClerkLoaded>
              <Show when="signed-in">
                {authLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="nav-link"
                    activeProps={{ className: 'nav-link is-active' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Show>
            </ClerkLoaded>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <HeaderUser />
          <button
            type="button"
            className="flex p-2 sm:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            <HugeiconsIcon
              icon={isOpen ? Cancel01Icon : Menu01Icon}
              className="size-5 text-(--text)"
            />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-0 right-0 top-[unset] z-40 bg-(--dropdown-bg) sm:hidden"
            style={{ top: 'var(--header-height, 57px)' }}
          >
            <motion.div className="flex flex-col gap-1 border-t border-(--border) px-4 py-3 shadow-lg">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.15 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={link.to}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-(--text-muted) transition-colors hover:bg-(--link-bg-hover) hover:text-(--text)"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <ClerkLoaded>
                <Show when="signed-in">
                  {authLinks.map((link, i) => (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: (navLinks.length + i) * 0.05,
                        duration: 0.15,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={link.to}
                        className="block rounded-md px-3 py-2 text-sm font-medium text-(--text-muted) transition-colors hover:bg-(--link-bg-hover) hover:text-(--text)"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </Show>
              </ClerkLoaded>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
