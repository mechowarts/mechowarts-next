import { getSessionAction } from '@/server/actions/auth.actions'
import { useQuery } from '@tanstack/react-query'

type AuthSession = Awaited<ReturnType<typeof getSessionAction>>
export type AuthSessionUser = NonNullable<AuthSession>['user']

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
  const result = useQuery({
    queryFn: getSessionAction,
    queryKey: ['auth-session'],
    retry: false,
  })

  return {
    user: result.data?.user ?? null,

    state: result.isPending
      ? 'loading'
      : result.data?.user
        ? 'authenticated'
        : 'unauthenticated',

    refetch: async () => {
      await result.refetch()
    },
  } as UnauthenticatedState | AuthenticatedState
}
