import { authClient } from '@/lib/auth-client'
import type { auth } from '@/server/lib/auth'
import type { Prettify } from 'daily-code'

type SessionData = Prettify<typeof auth.$Infer.Session>

export type AuthSessionUser = SessionData['user']

type UnauthenticatedState = {
  state: 'loading' | 'unauthenticated'
  user: null
  refetch: () => Promise<void>
}

type AuthenticatedState = {
  state: 'authenticated'
  user: AuthSessionUser
  refetch: () => Promise<void>
}

export function useAuth() {
  const result = authClient.useSession()

  console.log(result.data?.session)

  return {
    user: result.data?.user,

    state: result.isPending
      ? 'loading'
      : result.data
        ? 'authenticated'
        : 'unauthenticated',

    refetch: result.refetch,
  } as UnauthenticatedState | AuthenticatedState
}
