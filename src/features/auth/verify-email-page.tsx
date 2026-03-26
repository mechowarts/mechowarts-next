import { getUserByRoll } from '@/api/http/users'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function VerifyEmailPage() {
  const router = useRouter()
  const params = useParams<{ roll: string }>()
  const roll = typeof params.roll === 'string' ? params.roll : ''
  const userQuery = useQuery({
    queryKey: ['verify-email-user', roll],
    queryFn: () => getUserByRoll(roll),
    enabled: Boolean(roll),
  })

  useEffect(() => {
    if (userQuery.data) {
      router.replace(`/authentication/login/${roll}`)
    }
  }, [roll, router, userQuery.data])

  useEffect(() => {
    if (userQuery.error) {
      toast.error(
        userQuery.error instanceof Error
          ? userQuery.error.message
          : 'Failed to verify account.'
      )
      router.replace('/authentication')
    }
  }, [router, userQuery.error])

  if (userQuery.isLoading) {
    return <Spinner className="size-8" />
  }

  if (userQuery.data) {
    return <Spinner className="size-8" />
  }

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-foreground text-2xl font-bold">
        No account found for {roll}
      </h2>
      <p className="text-muted-foreground">
        Continue to registration and create a new account for this roll number.
      </p>

      <Button
        className="w-full"
        onClick={() => {
          router.push(`/authentication?roll=${roll}&step=register`)
        }}
      >
        Continue to Registration
      </Button>
    </div>
  )
}
