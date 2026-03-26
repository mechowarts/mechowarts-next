import { registerWithOtp, signInAccount } from '@/api/http/auth'
import { getUserByRoll } from '@/api/http/users'
import { Button } from '@/components/ui/button'
import { AuthStepper } from '@/features/auth/auth-stepper'
import { AuthUserPreview } from '@/features/auth/auth-user-preview'
import { LoginForm } from '@/features/auth/login-form'
import { ProgressiveRegisterStep } from '@/features/auth/progressive-register-step'
import { RollInput } from '@/features/auth/roll-input'
import type { ProgressiveAuthStep } from '@/types'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

function getStepFromSearchParams(
  searchParams: URLSearchParams
): ProgressiveAuthStep {
  const step = searchParams.get('step')

  switch (step) {
    case 'login':
    case 'register':
      return step
    default:
      return 'roll'
  }
}

export function ProgressiveAuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<ProgressiveAuthStep>(
    getStepFromSearchParams(searchParams)
  )
  const [stepHistory, setStepHistory] = useState<ProgressiveAuthStep[]>([
    'roll',
  ])
  const [roll, setRoll] = useState(searchParams.get('roll') ?? '')
  const [previewName, setPreviewName] = useState('')
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState('')

  const signInMutation = useMutation({
    mutationFn: signInAccount,
  })
  const registerMutation = useMutation({
    mutationFn: registerWithOtp,
  })

  useEffect(() => {
    if (!roll) {
      return
    }

    async function hydrateRoll() {
      try {
        const user = await getUserByRoll(roll)

        if (user) {
          setPreviewName(user.name)
          setPreviewAvatarUrl(user.avatarUrl)
          setStep('login')
          setStepHistory(['roll', 'login'])
          return
        }

        setPreviewName('')
        setPreviewAvatarUrl('')
        setStep('register')
        setStepHistory(['roll', 'register'])
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to load roll number.'
        )
      }
    }

    void hydrateRoll()
  }, [roll])

  const currentStepIndex = Math.max(stepHistory.indexOf(step), 0)
  const canGoBack = currentStepIndex > 0
  const isBusy = signInMutation.isPending || registerMutation.isPending

  return (
    <div className="space-y-6">
      <AuthStepper
        currentStepIndex={currentStepIndex}
        goToStep={(index) => {
          const nextStep = stepHistory[index]

          if (!nextStep) {
            return
          }

          setStep(nextStep)
          setStepHistory((current) => current.slice(0, index + 1))
        }}
        stepHistory={stepHistory}
      />

      {step === 'roll' ? (
        <>
          <div className="text-center">
            <h2 className="text-foreground text-2xl font-bold">
              Welcome to MechoWarts
            </h2>
            <p className="text-muted-foreground mt-2">
              Enter your roll number to continue with sign in or registration.
            </p>
          </div>

          <RollInput
            isLoading={isBusy}
            onSubmit={async (nextRoll) => {
              setRoll(nextRoll)

              try {
                const user = await getUserByRoll(nextRoll)

                if (user) {
                  setPreviewName(user.name)
                  setPreviewAvatarUrl(user.avatarUrl)
                  setStep('login')
                  setStepHistory(['roll', 'login'])
                  return
                }

                setPreviewName('')
                setPreviewAvatarUrl('')
                setStep('register')
                setStepHistory(['roll', 'register'])
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : 'Failed to continue.'
                )
              }
            }}
          />
        </>
      ) : null}

      {step === 'login' ? (
        <>
          <AuthUserPreview
            avatarUrl={previewAvatarUrl}
            name={previewName || 'User'}
          />
          <LoginForm
            isLoading={isBusy}
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
      ) : null}

      {step === 'register' ? (
        <ProgressiveRegisterStep
          isBusy={isBusy}
          roll={roll}
          onRegisterSubmit={({
            bio,
            bloodGroup,
            facebookUrl,
            firstName,
            homeTown,
            lastName,
            password,
            phone,
            tokens,
            otp,
          }) => {
            const name = `${firstName} ${lastName}`.trim()

            registerMutation.mutate(
              {
                bio,
                bloodGroup,
                facebookUrl: facebookUrl || undefined,
                homeTown,
                name,
                otp,
                password,
                phone: phone || undefined,
                rollNumber: Number.parseInt(roll, 10),
                tokens,
              },
              {
                async onSuccess() {
                  toast.success('Account created. Signing you in...')

                  try {
                    await signInAccount({
                      password,
                      rollNumber: Number.parseInt(roll, 10),
                    })
                    window.location.assign('/')
                  } catch (error) {
                    toast.success(
                      'Account created. Please sign in to continue.'
                    )
                    router.push(`/authentication/login/${roll}`)

                    if (error instanceof Error) {
                      toast.error(error.message)
                    }
                  }
                },
                onError(error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : 'Registration failed.'
                  )
                },
              }
            )
          }}
        />
      ) : null}

      {canGoBack ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="link"
            className="px-0"
            onClick={() => {
              const nextHistory = stepHistory.slice(0, -1)
              const previousStep = nextHistory.at(-1)

              if (!previousStep) {
                return
              }

              setStep(previousStep)
              setStepHistory(nextHistory)
            }}
          >
            Back
          </Button>
        </div>
      ) : null}
    </div>
  )
}
