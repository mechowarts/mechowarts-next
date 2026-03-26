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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { PasswordField } from '@/features/auth/password-field'
import {
  requestResetPasswordOtp,
  resetPassword,
} from '@/server/actions/auth.actions'
import { buildStudentEmail, isValidRollNumber } from '@/utils/roll'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, KeyRound, MailCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const rollSchema = z.object({
  roll: z
    .string()
    .trim()
    .refine(isValidRollNumber, 'Enter a valid roll number.'),
})

const resetSchema = z
  .object({
    confirmPassword: z.string(),
    otp: z.string().length(6, 'Enter the six-digit code.'),
    password: z.string().min(8, 'Password must be at least 8 characters long.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export function ForgotPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchRoll = searchParams.get('roll') ?? ''
  const initialRoll = useMemo(() => searchRoll, [searchRoll])
  const [stage, setStage] = useState<'request' | 'verify'>(
    initialRoll ? 'request' : 'request'
  )
  const [tokens, setTokens] = useState<string[]>([])
  const [email, setEmail] = useState(
    initialRoll ? buildStudentEmail(initialRoll) : ''
  )

  const rollForm = useForm<z.infer<typeof rollSchema>>({
    defaultValues: { roll: initialRoll },
    resolver: zodResolver(rollSchema),
  })
  const resetForm = useForm<z.infer<typeof resetSchema>>({
    defaultValues: {
      confirmPassword: '',
      otp: '',
      password: '',
    },
    resolver: zodResolver(resetSchema),
  })

  const requestOtpMutation = useMutation({
    mutationFn: requestResetPasswordOtp,
  })
  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
  })

  const currentRoll = rollForm.watch('roll')
  const currentEmail =
    email ||
    (isValidRollNumber(currentRoll) ? buildStudentEmail(currentRoll) : '')
  const isBusy = requestOtpMutation.isPending || resetPasswordMutation.isPending

  return (
    <div className="space-y-6">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-amber-700 uppercase">
          <KeyRound className="size-3.5" />
          Forget Password
        </div>
        <div>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight">
            Recover your account securely
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-6 sm:text-base">
            Request an OTP with your roll number, set a new password, and we log
            you back in right away.
          </p>
        </div>
      </div>

      {stage === 'request' ? (
        <Form {...rollForm}>
          <form
            className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
            onSubmit={rollForm.handleSubmit(({ roll }) => {
              requestOtpMutation.mutate(
                {
                  rollNumber: Number.parseInt(roll, 10),
                },
                {
                  onError(error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : 'Could not send the recovery code.'
                    )
                  },
                  onSuccess(data) {
                    setEmail(data.email)
                    setTokens((current) => [...current, data.token].slice(-5))
                    resetForm.reset({
                      confirmPassword: '',
                      otp: '',
                      password: '',
                    })
                    setStage('verify')
                    router.replace(`/forgot-password?roll=${roll}`)
                    toast.success('Recovery code sent to your student email.')
                  },
                }
              )
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
                      disabled={isBusy}
                    />
                  </FormControl>
                  <FormDescription>
                    {currentEmail ||
                      'We send the recovery OTP to your RUET student email.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="h-11 w-full rounded-full"
              disabled={isBusy}
            >
              <Loading loading={requestOtpMutation.isPending}>
                Request OTP
              </Loading>
            </Button>

            <p className="text-center text-sm text-slate-500">
              Remembered it? Go back to{' '}
              <Link
                href="/login"
                className="font-medium text-slate-900 underline-offset-4 hover:underline"
              >
                login
              </Link>
              .
            </p>
          </form>
        </Form>
      ) : null}

      {stage === 'verify' ? (
        <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <Button
            type="button"
            variant="ghost"
            className="-ml-3 h-auto justify-start px-3 text-slate-600 hover:text-slate-900"
            onClick={() => setStage('request')}
          >
            <ArrowLeft className="size-4" />
            Back to roll entry
          </Button>

          <div className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left">
            <div className="rounded-2xl bg-white p-2 text-slate-700 shadow-sm ring-1 ring-slate-200">
              <MailCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Recovery code sent
              </p>
              <p className="mt-1 text-sm text-slate-600">{currentEmail}</p>
            </div>
          </div>

          <Form {...resetForm}>
            <form
              className="space-y-5"
              onSubmit={resetForm.handleSubmit(({ otp, password }) => {
                resetPasswordMutation.mutate(
                  {
                    otp,
                    password,
                    tokens,
                  },
                  {
                    onError(error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : 'Could not reset the password.'
                      )
                    },
                    onSuccess() {
                      toast.success('Password updated. Logging you in now.')
                      window.location.assign('/')
                    },
                  }
                )
              })}
            >
              <FormField
                control={resetForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP</FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isBusy}
                        containerClassName="w-full justify-center"
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="h-12 w-12 rounded-xl border border-slate-300 bg-white text-base first:rounded-xl first:border last:rounded-xl"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={resetForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <PasswordField
                          {...field}
                          autoComplete="new-password"
                          placeholder="Enter a new password"
                          disabled={isBusy}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <PasswordField
                          {...field}
                          autoComplete="new-password"
                          placeholder="Repeat the password"
                          disabled={isBusy}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => {
                    const roll = rollForm.getValues('roll')

                    requestOtpMutation.mutate(
                      {
                        rollNumber: Number.parseInt(roll, 10),
                      },
                      {
                        onError(error) {
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : 'Could not resend the recovery code.'
                          )
                        },
                        onSuccess(data) {
                          setEmail(data.email)
                          setTokens((current) =>
                            [...current, data.token].slice(-5)
                          )
                          resetForm.setValue('otp', '')
                          toast.success('A fresh recovery code is on the way.')
                        },
                      }
                    )
                  }}
                >
                  <Loading loading={requestOtpMutation.isPending}>
                    Resend OTP
                  </Loading>
                </Button>

                <Button
                  type="submit"
                  className="rounded-full"
                  disabled={isBusy || tokens.length === 0}
                >
                  <Loading loading={resetPasswordMutation.isPending}>
                    Verify and continue
                  </Loading>
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : null}
    </div>
  )
}
