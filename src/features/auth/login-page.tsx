import { signInAccount } from '@/api/http/auth'
import { Spinner } from '@/components/ui/spinner'
import { AuthUserPreview } from '@/features/auth/auth-user-preview'
import { LoginForm } from '@/features/auth/login-form'
import { getUserByRoll } from '@/server/actions/users.actions'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function LoginPage() {
  const router = useRouter()
  const params = useParams<{ roll: string }>()
  const roll = typeof params.roll === 'string' ? params.roll : ''
  const signInMutation = useMutation({
    mutationFn: signInAccount,
  })
  const userQuery = useQuery({
    queryKey: ['auth-user', roll],
    queryFn: () => getUserByRoll(roll),
    enabled: Boolean(roll),
  })

  useEffect(() => {
    if (!userQuery.isLoading && !userQuery.data && roll) {
      router.replace(`/authentication?roll=${roll}&step=register`)
    }
  }, [roll, router, userQuery.data, userQuery.isLoading])

  if (userQuery.isLoading) {
    return <Spinner className="size-8" />
  }

  if (!userQuery.data) {
    return <Spinner className="size-8" />
  }

  return (
    <>
      <AuthUserPreview
        avatarUrl={userQuery.data.avatarUrl ?? undefined}
        name={userQuery.data.name}
      />

      <LoginForm
        isLoading={signInMutation.isPending}
        onForgot={() => {
          router.push(`/reset-password?roll=${roll}`)
        }}
        onSubmit={({ password }) => {
          signInMutation.mutate(
            { password, rollNumber: Number.parseInt(roll, 10) },
            {
              onSuccess() {
                toast.success('Login successful!')
                window.location.assign('/')
              },
              onError(error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : 'Login failed. Please try again.'
                )
              },
            }
          )
        }}
      />
    </>
  )
}
