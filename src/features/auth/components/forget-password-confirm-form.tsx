import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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
import { ArrowLeft01Icon, Mail01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { PasswordInput } from './password-input'

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
    <div className="bg-card rounded-2xl border p-8">
      <div className="relative mb-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground absolute top-1/2 -left-4 -translate-y-1/2"
          onClick={onBack}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-1 size-4" />
          Back
        </Button>

        <h1 className="text-foreground text-center text-2xl font-semibold tracking-tight">
          Reset password
        </h1>
      </div>

      <p className="text-muted-foreground mb-6 text-center text-sm">
        Enter the code sent to your email
      </p>

      <div className="bg-muted/40 mb-6 flex items-center gap-3 rounded-xl border p-4">
        <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-xl border">
          <HugeiconsIcon
            icon={Mail01Icon}
            className="text-muted-foreground size-5"
          />
        </div>
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-medium">
            {email}
          </p>
          <p className="text-muted-foreground text-xs">Roll {data.roll}</p>
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
                  form.setError('otp', {
                    message:
                      error instanceof Error
                        ? error.message
                        : 'Could not reset the password.',
                  })
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
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isBusy}
                    containerClassName="w-full justify-center gap-2"
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="bg-background h-12 w-12 rounded-lg border text-lg"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      autoComplete="new-password"
                      placeholder="Enter new password"
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
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      disabled={isBusy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2 pt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isBusy}
            >
              Reset Password
              {resetPasswordMutation.isPending && <Spinner />}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground w-full"
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
                          : 'Could not resend the code.'
                      )
                    },
                    onSuccess(next) {
                      setTokens((current) => [...current, next.token].slice(-5))
                      form.setValue('otp', '')
                      toast.success('A fresh code is on the way.')
                    },
                  }
                )
              }}
            >
              Resend code
              {resendMutation.isPending && <Spinner />}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
