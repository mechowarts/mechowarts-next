import { createUserAccount, signInAccount } from '@/api/http/auth'
import { completeUserProfile, getUserByRoll } from '@/api/http/users'
import { Button } from '@/components/ui/button'
import { AuthStepper } from '@/features/auth/auth-stepper'
import { AuthUserPreview } from '@/features/auth/auth-user-preview'
import { LoginForm } from '@/features/auth/login-form'
import { ProgressiveProfileStep } from '@/features/auth/progressive-profile-step'
import { ProgressiveRegisterStep } from '@/features/auth/progressive-register-step'
import { RollInput } from '@/features/auth/roll-input'
import { useAuth } from '@/hooks/use-auth'
import type { ProgressiveAuthStep } from '@/types'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import 'react-phone-input-2/lib/style.css'
import { toast } from 'sonner'

function getStepFromSearchParams(
  searchParams: URLSearchParams
): ProgressiveAuthStep {
  const step = searchParams.get('step')

  switch (step) {
    case 'login':
    case 'register':
    case 'profile':
    case 'logged-in':
      return step
    default:
      return 'roll'
  }
}

export function ProgressiveAuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const currentUserId = user?.id
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
  const createUserAccountMutation = useMutation({
    mutationFn: createUserAccount,
  })
  const completeUserProfileMutation = useMutation({
    mutationFn: completeUserProfile,
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
  const canGoBack = currentStepIndex > 0 && step !== 'logged-in'
  const isBusy =
    signInMutation.isPending ||
    createUserAccountMutation.isPending ||
    completeUserProfileMutation.isPending

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
          <h2 className="text-foreground mb-2 text-center text-2xl font-bold">
            Welcome to MechoWarts
          </h2>
          <p className="text-muted-foreground mb-6 text-center">
            Enter your roll number to continue.
          </p>
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
          onRegisterSubmit={({ firstName, lastName, password }) => {
            const name = `${firstName} ${lastName}`.trim()

            createUserAccountMutation.mutate(
              {
                name,
                password,
                rollNumber: Number.parseInt(roll, 10),
              },
              {
                onSuccess() {
                  window.location.assign('/')
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

      {step === 'profile' ? (
        <ProgressiveProfileStep
          isLoading={completeUserProfileMutation.isPending}
          onSkip={() => {
            router.push('/')
          }}
          onSubmit={(profileData) => {
            if (!currentUserId) {
              toast.error('You need to be signed in to complete your profile.')
              return
            }

            completeUserProfileMutation.mutate(
              {
                id: currentUserId,
                rollNumber: Number.parseInt(roll, 10),
                name: profileData.name,
                avatarUrl:
                  previewAvatarUrl || '/assets/icons/profile-placeholder.svg',
                bio: profileData.bio,
                bloodGroup: profileData.bloodGroup,
                homeTown: profileData.homeTown,
                colleges: profileData.colleges,
                schools: profileData.schools,
              },
              {
                onSuccess() {
                  toast.success('Profile completed successfully.')
                  router.push('/')
                },
                onError(error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : 'Failed to complete profile.'
                  )
                },
              }
            )
          }}
        />
      ) : null}

      {step === 'logged-in' ? (
        <div className="border-border bg-card rounded-3xl border p-8 text-center">
          <h2 className="text-primary mb-2 text-2xl font-bold">Logged in!</h2>
          <p className="text-muted-foreground">Welcome to MechoWarts.</p>
        </div>
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
