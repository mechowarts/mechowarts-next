import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'
import { requestResetPasswordOTPAction } from '@/server/actions/auth.actions'
import { isValidRollNumber } from '@/utils/roll'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { RollNumberInput } from './roll-number-input'

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
  const form = useForm<z.infer<typeof rollSchema>>({
    defaultValues: { roll: defaultRoll },
    resolver: zodResolver(rollSchema),
  })
  const requestOtpMutation = useMutation({
    mutationFn: requestResetPasswordOTPAction,
  })

  return (
    <div className="bg-card rounded-2xl border p-8">
      <div className="mb-8 text-center">
        <h1 className="text-foreground mb-2 text-2xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your roll number and we will send a recovery code to your
          student email.
        </p>
      </div>

      <Form {...form}>
        <form
          className="space-y-6"
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
                <FormLabel>Roll Number</FormLabel>
                <FormControl>
                  <RollNumberInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <Button
              size="lg"
              type="submit"
              disabled={requestOtpMutation.isPending}
              className="w-full"
            >
              Continue
              {requestOtpMutation.isPending && <Spinner />}
            </Button>

            <p className="text-muted-foreground text-center text-sm">
              Remembered it? Go back to{' '}
              <Link
                href="/login"
                className="text-foreground hover:text-primary font-medium underline-offset-4 transition-colors hover:underline"
              >
                login
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  )
}
