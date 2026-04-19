import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import HeaderUser from '@/integrations/clerk/header-user'
import { Show, ClerkLoaded } from '@clerk/tanstack-react-start'

export default function Header() {
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

          <div className="flex items-center gap-5 text-sm font-medium">
            <Link
              to="/"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              About
            </Link>
            <ClerkLoaded>
              <Show when="signed-in">
                <Link
                <Link
                  to="/dashboard"
                  className="nav-link"
                  activeProps={{ className: 'nav-link is-active' }}
                >
                  Dashboard
                </Link>
              </Show>
            </ClerkLoaded>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <HeaderUser />
        </div>
      </nav>
    </header>
  )
}
