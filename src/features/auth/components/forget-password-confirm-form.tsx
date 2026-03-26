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
import { ArrowLeft, KeyRound, MailCheck } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'

type ForgetPasswordConfirmFormProps = {
  canSubmit: boolean
  email: string
  form: UseFormReturn<{
    confirmPassword: string
    otp: string
    password: string
  }>
  isResetting: boolean
  isResending: boolean
  onBack: () => void
  onResend: () => void
  onSubmit: (values: {
    confirmPassword: string
    otp: string
    password: string
  }) => void
  roll: string
}

export function ForgetPasswordConfirmForm({
  canSubmit,
  email,
  form,
  isResetting,
  isResending,
  onBack,
  onResend,
  onSubmit,
  roll,
}: ForgetPasswordConfirmFormProps) {
  const isBusy = isResetting || isResending

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-amber-700 uppercase">
          <KeyRound className="size-3.5" />
          Forgot Password
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Verify and set a new password
          </h1>
          <p className="text-sm leading-6 text-slate-600 sm:text-base">
            Use the recovery code from your inbox, then choose a fresh password.
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
          Back to roll entry
        </Button>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3 text-left">
            <div className="rounded-2xl bg-white p-2 text-slate-700 shadow-sm ring-1 ring-slate-200">
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
            <span className="font-semibold text-slate-900">{roll}</span>.
          </div>
        </div>

        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
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
                onClick={onResend}
              >
                <Loading loading={isResending}>Resend OTP</Loading>
              </Button>

              <Button
                type="submit"
                className="rounded-full"
                disabled={isBusy || !canSubmit}
              >
                <Loading loading={isResetting}>Verify and continue</Loading>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
