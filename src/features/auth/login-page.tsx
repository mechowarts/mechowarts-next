import { LoginStartForm } from '@/features/auth/components/login-start-form'
import { LoginWithPasswordForm } from '@/features/auth/components/login-with-password-form'
import { signInAction } from '@/server/actions/auth.actions'
import { getUserByRoll } from '@/server/actions/users.actions'
import { isValidRollNumber } from '@/utils/roll'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const rollSchema = z.object({
  roll: z
    .string()
    .trim()
    .refine(isValidRollNumber, 'Enter a valid roll number.'),
})

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
})

type LoginStep = 'password' | 'roll'

export function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchRoll = searchParams.get('roll') ?? ''
  const initialRoll = useMemo(() => searchRoll, [searchRoll])
  const [roll, setRoll] = useState(initialRoll)
  const [step, setStep] = useState<LoginStep>(initialRoll ? 'password' : 'roll')

  const rollForm = useForm<z.infer<typeof rollSchema>>({
    defaultValues: { roll: initialRoll },
    resolver: zodResolver(rollSchema),
  })
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    defaultValues: { password: '' },
    resolver: zodResolver(passwordSchema),
  })

  const signInMutation = useMutation({
    mutationFn: signInAction,
  })
  const userQuery = useQuery({
    enabled: step === 'password' && Boolean(roll),
    queryFn: () => getUserByRoll(roll),
    queryKey: ['auth-user', roll],
  })

  useEffect(() => {
    if (
      step !== 'password' ||
      !roll ||
      !userQuery.isSuccess ||
      userQuery.data
    ) {
      return
    }

    toast.info('No account found for that roll. Continue with registration.')
    router.replace(`/register?roll=${roll}`)
  }, [roll, router, step, userQuery.data, userQuery.isSuccess])

  useEffect(() => {
    if (!userQuery.error) {
      return
    }

    toast.error(
      userQuery.error instanceof Error
        ? userQuery.error.message
        : 'Could not load the account.'
    )
  }, [userQuery.error])

  return (
    <div className="space-y-6">
      {step === 'roll' ? (
        <LoginStartForm
          form={rollForm}
          isSubmitting={false}
          onSubmit={({ roll: nextRoll }) => {
            const normalizedRoll = nextRoll.trim()

            setRoll(normalizedRoll)
            setStep('password')
            passwordForm.reset({ password: '' })
            router.replace(`/login?roll=${normalizedRoll}`)
          }}
        />
      ) : null}

      {step === 'password' ? (
        <LoginWithPasswordForm
          avatarUrl={userQuery.data?.avatar}
          form={passwordForm}
          isLoading={userQuery.isLoading}
          isSubmitting={signInMutation.isPending}
          name={userQuery.data?.name}
          onBack={() => {
            setStep('roll')
            setRoll('')
            passwordForm.reset({ password: '' })
            router.replace('/login')
          }}
          onSubmit={({ password }) => {
            signInMutation.mutate(
              {
                password,
                roll: Number.parseInt(roll, 10),
              },
              {
                onError(error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : 'Login failed. Please try again.'
                  )
                },
                onSuccess() {
                  toast.success('Logged in successfully.')
                  window.location.assign('/')
                },
              }
            )
          }}
          roll={roll}
        />
      ) : null}
    </div>
  )
}
