import { Button, Loading } from '@/components/ui/button'
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
import type { RegisterFlowData } from '@/features/auth/components/register-request-form'
import {
  confirmRegisterOTPAction,
  requestRegisterOTPAction,
} from '@/server/actions/auth.actions'
import { buildStudentEmail } from '@/utils/roll'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, MailCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const otpSchema = z.object({
  otp: z.string().length(6, 'Enter the six-digit code.'),
})

type RegisterConfirmFormProps = {
  data: RegisterFlowData
  onBack: () => void
}

export function RegisterConfirmForm({
  data,
  onBack,
}: RegisterConfirmFormProps) {
  const form = useForm<z.infer<typeof otpSchema>>({
    defaultValues: { otp: '' },
    resolver: zodResolver(otpSchema),
  })

  const [tokens, setTokens] = useState(data.tokens)

  const resendMutation = useMutation({
    mutationFn: requestRegisterOTPAction,
  })

  const registerMutation = useMutation({
    mutationFn: confirmRegisterOTPAction,
  })

  const isBusy = resendMutation.isPending || registerMutation.isPending
  const email = buildStudentEmail(data.roll)

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-emerald-700 uppercase">
          <Sparkles className="size-3.5" />
          Register
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Verify your email
          </h1>
          <p className="text-sm leading-6 text-slate-600 sm:text-base">
            Enter the six-digit code sent to your student inbox to activate your
            account.
          </p>
        </div>
      </div>

      <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          className="-ml-3 h-auto justify-start px-3 text-slate-600 hover:text-slate-900"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
          Back to details
        </Button>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3 text-left">
            <div className="rounded-2xl bg-white p-2 text-slate-700 shadow-sm ring-1 ring-slate-200">
              <MailCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Verification code sent
              </p>
              <p className="mt-1 text-sm text-slate-600">{email}</p>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-slate-500 uppercase">
                Name
              </p>
              <p className="mt-1 font-medium text-slate-900">{data.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-slate-500 uppercase">
                Roll
              </p>
              <p className="mt-1 font-medium text-slate-900">{data.roll}</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit(({ otp }) => {
              registerMutation.mutate(
                {
                  gender: data.gender,
                  location: data.location,
                  name: data.name,
                  otp,
                  password: data.password,
                  roll: Number.parseInt(data.roll, 10),
                  tokens,
                  visibility: data.visibility,
                },
                {
                  onError(error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : 'Registration failed.'
                    )
                  },
                  onSuccess() {
                    toast.success('Account created. Logging you in now.')
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
                  <FormLabel>Verification code</FormLabel>
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
                            : 'Could not resend the verification code.'
                        )
                      },
                      onSuccess(next) {
                        setTokens((current) =>
                          [...current, next.token].slice(-5)
                        )
                        form.reset({ otp: '' })
                        toast.success(
                          'A fresh verification code is on the way.'
                        )
                      },
                    }
                  )
                }}
              >
                <Loading loading={resendMutation.isPending}>Resend OTP</Loading>
              </Button>

              <Button type="submit" className="rounded-full" disabled={isBusy}>
                <Loading loading={registerMutation.isPending}>
                  Verify and create account
                </Loading>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
