import type { auth } from '@/server/lib/auth'
import { authClient } from '@/lib/auth-client'
import type { Prettify } from 'daily-code'

type SessionData = Prettify<typeof auth.$Infer.Session>

type UnauthenticatedState = {
  state: 'loading' | 'unauthenticated'
  refetch: () => Promise<void>

  user: null
  session: null
}

type AuthenticatedState = {
  state: 'authenticated'
  refetch: () => Promise<void>

  user: SessionData['user']

  session: SessionData['session']
}

export function useAuth() {
  const result = authClient.useSession()

  return {
    user: result.data?.user,
    session: result.data?.session,

    state: result.isPending
      ? 'loading'
      : result.data
        ? 'authenticated'
        : 'unauthenticated',

    refetch: result.refetch,
  } as UnauthenticatedState | AuthenticatedState
}
