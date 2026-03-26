import { Button, Loading } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { AuthUserPreview } from '@/features/auth/auth-user-preview'
import { PasswordField } from '@/features/auth/password-field'
import { isValidRollNumber } from '@/utils/roll'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { signInAction } from '@/server/actions/auth.actions'
import { getUserByRoll } from '@/server/actions/users.actions'
import { toast } from 'sonner'

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

  return (
    <div className="space-y-6">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-slate-700 uppercase">
          <ShieldCheck className="size-3.5" />
          Login
        </div>
        <div>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight">
            Sign in with your roll number
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-6 sm:text-base">
            Start with your RUET roll. If no account exists, we send you
            straight to registration with the roll already filled in.
          </p>
        </div>
      </div>

      {step === 'roll' ? (
        <Form {...rollForm}>
          <form
            className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
            onSubmit={rollForm.handleSubmit(({ roll: nextRoll }) => {
              const normalizedRoll = nextRoll.trim()

              setRoll(normalizedRoll)
              setStep('password')
              passwordForm.reset({ password: '' })
              router.replace(`/login?roll=${normalizedRoll}`)
            })}
          >
            <FormField
              control={rollForm.control}
              name="roll"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roll number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      inputMode="numeric"
                      placeholder="2108061"
                      onChange={(event) =>
                        field.onChange(
                          event.target.value.replace(/\D/g, '').slice(0, 7)
                        )
                      }
                      disabled={userQuery.isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Use your full RUET mechanical engineering roll.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="h-11 w-full rounded-full">
              <Loading loading={userQuery.isLoading}>Continue</Loading>
            </Button>

            <p className="text-center text-sm text-slate-500">
              New here? Go to{' '}
              <Link
                href="/register"
                className="font-medium text-slate-900 underline-offset-4 hover:underline"
              >
                registration
              </Link>
              .
            </p>
          </form>
        </Form>
      ) : null}

      {step === 'password' ? (
        <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <Button
            type="button"
            variant="ghost"
            className="-ml-3 h-auto justify-start px-3 text-slate-600 hover:text-slate-900"
            onClick={() => {
              setStep('roll')
              setRoll('')
              passwordForm.reset({ password: '' })
              router.replace('/login')
            }}
          >
            <ArrowLeft className="size-4" />
            Change roll number
          </Button>

          {userQuery.isLoading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Spinner className="size-8" />
            </div>
          ) : null}

          {userQuery.data ? (
            <>
              <AuthUserPreview
                avatarUrl={userQuery.data.avatar ?? undefined}
                name={userQuery.data.name}
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Signing in as roll{' '}
                <span className="font-semibold text-slate-900">{roll}</span>
              </div>

              <Form {...passwordForm}>
                <form
                  className="space-y-4"
                  onSubmit={passwordForm.handleSubmit(({ password }) => {
                    signInMutation.mutate(
                      {
                        password,
                        rollNumber: Number.parseInt(roll, 10),
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
                  })}
                >
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordField
                            {...field}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            disabled={signInMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-full"
                    disabled={signInMutation.isPending}
                  >
                    <Loading loading={signInMutation.isPending}>
                      Sign in
                    </Loading>
                  </Button>

                  <Button
                    asChild
                    type="button"
                    variant="link"
                    className="mx-auto flex h-auto px-0 text-sm text-slate-600"
                  >
                    <Link href={`/forgot-password?roll=${roll}`}>
                      <KeyRound className="size-4" />
                      Forgot password?
                    </Link>
                  </Button>
                </form>
              </Form>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
