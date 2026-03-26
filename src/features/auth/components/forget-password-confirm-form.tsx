import { Button } from '@/components/ui/button'
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
import { Spinner } from '@/components/ui/spinner'
import type { ForgotPasswordFlowData } from '@/features/auth/components/forget-password-request-form'
import {
  confirmResetPasswordOTPAction,
  requestResetPasswordOTPAction,
} from '@/server/actions/auth.actions'
import { buildStudentEmail } from '@/utils/roll'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const resetSchema = z
  .object({
    confirmPassword: z.string(),
    otp: z.string().length(6, 'Enter the six-digit code.'),
    password: z.string().min(6, 'Password must be at least 6 characters long.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

type ForgetPasswordConfirmFormProps = {
  data: ForgotPasswordFlowData
  onBack: () => void
}

export function ForgetPasswordConfirmForm({
  data,
  onBack,
}: ForgetPasswordConfirmFormProps) {
  const form = useForm<z.infer<typeof resetSchema>>({
    defaultValues: {
      otp: '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(resetSchema),
  })

  const [tokens, setTokens] = useState(data.tokens)
  const resendMutation = useMutation({
    mutationFn: requestResetPasswordOTPAction,
  })

  const resetPasswordMutation = useMutation({
    mutationFn: confirmResetPasswordOTPAction,
  })

  const isBusy = resendMutation.isPending || resetPasswordMutation.isPending
  const email = buildStudentEmail(data.roll)

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Verify and set a new password
          </h1>
          <p className="text-sm leading-6 text-slate-600 sm:text-base">
            Use the recovery code from your inbox, then choose a fresh password.
          </p>
        </div>
      </div>

      <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6">
        <Button
          type="button"
          variant="ghost"
          className="-ml-3 h-auto justify-start px-3 text-slate-600 hover:text-slate-900"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
          Back to roll entry
        </Button>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3 text-left">
            <div className="rounded-2xl bg-white p-2 text-slate-700 ring-1 ring-slate-200">
              <MailCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Recovery code sent
              </p>
              <p className="mt-1 text-sm text-slate-600">{email}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Resetting the password for roll{' '}
            <span className="font-semibold text-slate-900">{data.roll}</span>.
          </div>
        </div>

        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit(({ otp, password }) => {
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
              control={form.control}
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
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
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
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
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
                  resendMutation.mutate(
                    {
                      roll: Number.parseInt(data.roll, 10),
                    },
                    {
                      onError(error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : 'Could not resend the recovery code.'
                        )
                      },
                      onSuccess(next) {
                        setTokens((current) =>
                          [...current, next.token].slice(-5)
                        )
                        form.setValue('otp', '')
                        toast.success('A fresh recovery code is on the way.')
                      },
                    }
                  )
                }}
              >
                Resend OTP
                {resendMutation.isPending && <Spinner />}
              </Button>

              <Button type="submit" className="rounded-full" disabled={isBusy}>
                Verify and continue
                {resetPasswordMutation.isPending && <Spinner />}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
