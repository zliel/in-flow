import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

export interface RootProviderProps {
  children: ReactNode
}

export interface RootContext {
  queryClient: QueryClient
}

export const getContext = (): RootContext => {
  return {
    queryClient: new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          gcTime: 1000 * 60 * 10,
        },
      },
    }),
  }
}

export default function RootProvider({ children }: RootProviderProps) {
  const context = getContext()
  return (
    <QueryClientProvider client={context.queryClient}>
      {children}
    </QueryClientProvider>
  )
}
