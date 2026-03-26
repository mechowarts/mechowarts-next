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
import { requestResetPasswordOTPAction } from '@/server/actions/auth.actions'
import { buildStudentEmail, isValidRollNumber } from '@/utils/roll'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { KeyRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const rollSchema = z.object({
  roll: z
    .string()
    .trim()
    .refine(isValidRollNumber, 'Enter a valid roll number.'),
})

export type ForgotPasswordFlowData = {
  roll: string
  tokens: string[]
}

type ForgetPasswordRequestFormProps = {
  defaultRoll: string
  onSubmit: (values: ForgotPasswordFlowData) => void
}

export function ForgetPasswordRequestForm({
  defaultRoll,
  onSubmit,
}: ForgetPasswordRequestFormProps) {
  const router = useRouter()
  const form = useForm<z.infer<typeof rollSchema>>({
    defaultValues: { roll: defaultRoll },
    resolver: zodResolver(rollSchema),
  })
  const requestOtpMutation = useMutation({
    mutationFn: requestResetPasswordOTPAction,
  })
  const currentRoll = form.watch('roll')
  const currentEmail = isValidRollNumber(currentRoll)
    ? buildStudentEmail(currentRoll)
    : ''

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-amber-700 uppercase">
          <KeyRound className="size-3.5" />
          Forgot Password
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Reset your password
          </h1>
          <p className="text-sm leading-6 text-slate-600 sm:text-base">
            Enter your roll number and we will send a recovery code to your
            student email.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 "
          onSubmit={form.handleSubmit(({ roll }) => {
            requestOtpMutation.mutate(
              {
                roll: Number.parseInt(roll, 10),
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
                  onSubmit({ roll, tokens: [data.token] })
                  router.replace(`/forgot-password?roll=${roll}`)
                  toast.success('Recovery code sent to your student email.')
                },
              }
            )
          })}
        >
          <FormField
            control={form.control}
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
                    disabled={requestOtpMutation.isPending}
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
            disabled={requestOtpMutation.isPending}
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
    </div>
  )
}
