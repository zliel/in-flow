import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { ClerkProvider } from '@clerk/tanstack-react-start'
import TanStackQueryDevtools from '@/integrations/tanstack-query/devtools'

import appCss from '@/styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

interface MyRouterContext {
  queryClient: QueryClient
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`


export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'InFlow',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {

  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      const root = document.documentElement
      const dark =
        root.classList.contains('dark') ||
        root.getAttribute('data-theme') === 'dark' ||
        (!root.classList.contains('light') &&
          !root.getAttribute('data-theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      setIsDark(dark)
    }
    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  const appearance = {
    elements: {
      card: {
        backgroundColor: isDark ? 'rgba(20, 26, 46, 0.95)' : "#ffffff"
      },
      footer: {
        background: isDark ? 'rgba(20, 26, 46, 0.75)' : '#eeeeee',
      },
      profileSectionPrimaryButton: {
        color: isDark ? 'rgba(225, 225, 225, 0.85)' : '#3d4f6f',
      }
    },
    variables: isDark
      ? {
        colorPrimary: 'rgb(50, 56, 76)',
        colorPrimaryForeground: '#e0e5f0',
        colorForeground: 'rgba(224, 229, 240, 0.75)',
        colorBackground: '#0f1424',
        colorInputForeground: '#e0e5f0',
        colorInput: 'rgba(20, 26, 46, 0.95)',
        fontFamily: 'Manrope, system-ui, sans-serif',
        colorSuccess: '#22c55e',
        colorWarning: '#f59e0b',
        colorDanger: '#ef4444',
      }
      : {
        colorPrimary: '#3d4f6f',
        colorPrimaryForeground: '#ffffff',
        colorBackground: '#edf0f7',
        colorInputForeground: '#3d4f6f',
        colorInput: '#ffffff',
        fontFamily: 'Manrope, system-ui, sans-serif',
        colorSuccess: '#22c55e',
        colorWarning: '#f59e0b',
        colorDanger: '#ef4444',
      },
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased wrap-anywhere selection:bg-[rgba(79,184,178,0.24)]">
        <ClerkProvider appearance={appearance}>
          <Header />
          {children}
          <Footer />
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              {
                name: 'Tanstack Query',
                render: <TanStackQueryDevtools />,
              }
            ]}
          />
          <Scripts />
        </ClerkProvider>
      </body>
    </html >
  )
}
