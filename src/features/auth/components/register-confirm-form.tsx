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
import type { RegisterFlowData } from '@/features/auth/components/register-request-form'
import {
  confirmRegisterOTPAction,
  requestRegisterOTPAction,
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
    <div className="mx-auto w-full max-w-sm">
      <div className="bg-card rounded-2xl border p-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-auto px-0"
            onClick={onBack}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-1 size-4" />
            Back
          </Button>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-foreground mb-2 text-2xl font-semibold tracking-tight">
            Verify your email
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter the 6-digit code we sent you
          </p>
        </div>

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
            className="space-y-6"
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
                    form.setError('otp', {
                      message:
                        error instanceof Error
                          ? error.message
                          : 'Registration failed.',
                    })
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
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isBusy}
              >
                Create Account
                {registerMutation.isPending && <Spinner />}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-auto w-full"
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
                        setTokens((current) =>
                          [...current, next.token].slice(-5)
                        )
                        form.reset({ otp: '' })
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
    </div>
  )
}
