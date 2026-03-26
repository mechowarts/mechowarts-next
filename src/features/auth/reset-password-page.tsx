import {
  requestResetPasswordOtp,
  resetPassword,
  verifyResetPasswordOtp,
} from '@/api/http/auth'
import { Button, Loading } from '@/components/ui/button'
import {
  Form,
  FormControl,
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
import { AuthStageTiles } from '@/features/auth/auth-stage-tiles'
import { PasswordField } from '@/features/auth/password-field'
import { buildStudentEmail } from '@/utils/roll'
import { useMutation } from '@tanstack/react-query'
import { KeyRound, MailCheck, ShieldCheck } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type ResetPasswordStage = 'identify' | 'verify' | 'password'

const resetPasswordStages: Array<{ id: ResetPasswordStage; label: string }> = [
  { id: 'identify', label: 'Find account' },
  { id: 'verify', label: 'Verify code' },
  { id: 'password', label: 'Set password' },
]

export function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [stage, setStage] = useState<ResetPasswordStage>('identify')
  const [tokens, setTokens] = useState<string[]>([])
  const [email, setEmail] = useState(
    searchParams.get('roll')
      ? buildStudentEmail(searchParams.get('roll') || '')
      : ''
  )
  const form = useForm({
    defaultValues: {
      confirmPassword: '',
      otp: '',
      password: '',
      rollNumber: searchParams.get('roll') || '',
    },
  })
  const requestOtpMutation = useMutation({
    mutationFn: requestResetPasswordOtp,
  })
  const verifyOtpMutation = useMutation({
    mutationFn: verifyResetPasswordOtp,
  })
  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
  })
  const currentStageIndex = resetPasswordStages.findIndex(
    ({ id }) => id === stage
  )
  const otpValue = form.watch('otp')
  const summary = useMemo(() => {
    if (tokens.length === 0) {
      return 'Request a one-time code to prove this account belongs to you.'
    }

    return `Your last ${tokens.length} code${tokens.length === 1 ? '' : 's'} stay active for verification, so you can keep using the latest email.`
  }, [tokens.length])
  const isBusy =
    requestOtpMutation.isPending ||
    verifyOtpMutation.isPending ||
    resetPasswordMutation.isPending

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(({ otp, password }) => {
          resetPasswordMutation.mutate(
            { otp, password, tokens },
            {
              onSuccess(data) {
                toast.success('Password reset successful. Please sign in.')
                router.push(`/authentication/login/${data.rollNumber}`)
              },
              onError(error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : 'Failed to reset password.'
                )
              },
            }
          )
        })}
      >
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold tracking-[0.28em] text-amber-700 uppercase">
            <KeyRound className="size-3.5" />
            Password recovery
          </div>
          <div>
            <h2 className="text-foreground text-2xl font-bold">
              Forgot your password?
            </h2>
            <p className="text-muted-foreground mt-2">
              Recover your account with an email code and choose a fresh
              password.
            </p>
          </div>
        </div>

        <AuthStageTiles
          currentIndex={currentStageIndex}
          steps={resetPasswordStages}
        />

        {stage === 'identify' ? (
          <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm">
            <FormField
              control={form.control}
              name="rollNumber"
              rules={{
                required: 'Roll number is required.',
                validate: (value) => {
                  const parsedRoll = Number.parseInt(value, 10)

                  return (
                    (Number.isInteger(parsedRoll) && parsedRoll > 0) ||
                    'Please enter a valid roll number.'
                  )
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="rollNumber">Roll number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="rollNumber"
                      type="text"
                      inputMode="numeric"
                      value={field.value}
                      onChange={(event) =>
                        field.onChange(event.target.value.replace(/\D/g, ''))
                      }
                      placeholder="Enter your roll number"
                      disabled={isBusy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              The code will be sent to your RUET student email address for this
              roll.
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                disabled={isBusy}
                onClick={async () => {
                  const isValid = await form.trigger('rollNumber')

                  if (!isValid) {
                    return
                  }

                  requestOtpMutation.mutate(
                    {
                      rollNumber: Number.parseInt(
                        form.getValues('rollNumber'),
                        10
                      ),
                    },
                    {
                      onSuccess(data) {
                        setEmail(data.email)
                        setTokens((current) =>
                          [...current, data.token].slice(-5)
                        )
                        setStage('verify')
                        toast.success('Recovery code sent to your email.')
                      },
                      onError(error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : 'Could not send the recovery code.'
                        )
                      },
                    }
                  )
                }}
              >
                <Loading loading={requestOtpMutation.isPending}>
                  Send recovery code
                </Loading>
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => router.push('/authentication')}
              >
                Back to sign in
              </Button>
            </div>
          </div>
        ) : null}

        {stage === 'verify' ? (
          <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm">
            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-left">
              <div className="rounded-2xl bg-white p-2 text-slate-700 shadow-sm ring-1 ring-slate-200">
                <MailCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Recovery email
                </p>
                <p className="text-sm text-slate-600">{email}</p>
                <p className="mt-2 text-sm text-slate-500">{summary}</p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="otp"
              rules={{
                required: 'Enter the six-digit code from your email.',
                validate: (value) =>
                  value.length === 6 || 'Enter the full six-digit code.',
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recovery code</FormLabel>
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

            <div className="grid gap-3 sm:grid-cols-3">
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => setStage('identify')}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => {
                  requestOtpMutation.mutate(
                    {
                      rollNumber: Number.parseInt(
                        form.getValues('rollNumber'),
                        10
                      ),
                    },
                    {
                      onSuccess(data) {
                        setEmail(data.email)
                        setTokens((current) =>
                          [...current, data.token].slice(-5)
                        )
                        toast.success('A fresh recovery code is on the way.')
                      },
                      onError(error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : 'Could not resend the recovery code.'
                        )
                      },
                    }
                  )
                }}
              >
                <Loading loading={requestOtpMutation.isPending}>
                  Resend code
                </Loading>
              </Button>
              <Button
                type="button"
                disabled={
                  otpValue.length !== 6 || isBusy || tokens.length === 0
                }
                onClick={() => {
                  verifyOtpMutation.mutate(
                    {
                      otp: form.getValues('otp'),
                      tokens,
                    },
                    {
                      onSuccess(data) {
                        setEmail(data.email)
                        setStage('password')
                        toast.success('Code verified. Set a new password now.')
                      },
                      onError(error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : 'Could not verify the recovery code.'
                        )
                      },
                    }
                  )
                }}
              >
                <Loading loading={verifyOtpMutation.isPending}>
                  Verify code
                </Loading>
              </Button>
            </div>
          </div>
        ) : null}

        {stage === 'password' ? (
          <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm">
            <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-left text-emerald-900">
              <ShieldCheck className="mt-0.5 size-5" />
              <div>
                <p className="text-sm font-semibold">Code verified</p>
                <p className="text-sm text-emerald-800">
                  Choose a new password for {form.getValues('rollNumber')}.
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="password"
              rules={{
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters long.',
                },
                required: 'Password is required.',
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="newPassword">New password</FormLabel>
                  <FormControl>
                    <PasswordField
                      {...field}
                      id="newPassword"
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      disabled={isBusy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              rules={{
                required: 'Please confirm your password.',
                validate: (value) =>
                  value === form.getValues('password') ||
                  'Passwords do not match.',
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="confirmPassword">
                    Confirm password
                  </FormLabel>
                  <FormControl>
                    <PasswordField
                      {...field}
                      id="confirmPassword"
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      disabled={isBusy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => setStage('verify')}
              >
                Back
              </Button>
              <Button type="submit" disabled={isBusy}>
                <Loading loading={resetPasswordMutation.isPending}>
                  Reset password
                </Loading>
              </Button>
            </div>
          </div>
        ) : null}
      </form>
    </Form>
  )
}
