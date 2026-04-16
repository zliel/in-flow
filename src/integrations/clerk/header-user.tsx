import {
  SignInButton,
  UserButton,
  Show,
  ClerkLoading,
  ClerkLoaded
} from '@clerk/tanstack-react-start'
import { Skeleton } from '#/components/ui/skeleton';

export default function HeaderUser() {
  return (
    <div className="h-7 w-7">
      <ClerkLoading>
        <Skeleton className="h-7 w-7 animate-pulse rounded-full bg-gray-300" />
      </ClerkLoading>
      <ClerkLoaded>
        <Show when="signed-in">
          <UserButton />
        </Show>
        <Show when="signed-out">
          <SignInButton />
        </Show>
      </ClerkLoaded>
    </div>
  )
}
