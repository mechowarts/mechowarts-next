import { ForgetPasswordConfirmForm } from '@/features/auth/components/forget-password-confirm-form'
import { ForgetPasswordRequestForm } from '@/features/auth/components/forget-password-request-form'
import {
  confirmResetPasswordOTPAction,
  requestResetPasswordOTPAction,
} from '@/server/actions/auth.actions'
import { buildStudentEmail, isValidRollNumber } from '@/utils/roll'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
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
  const [stage, setStage] = useState<'request' | 'verify'>('request')
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
    mutationFn: requestResetPasswordOTPAction,
  })
  const resetPasswordMutation = useMutation({
    mutationFn: confirmResetPasswordOTPAction,
  })

  const currentRoll = rollForm.watch('roll')
  const currentEmail =
    email ||
    (isValidRollNumber(currentRoll) ? buildStudentEmail(currentRoll) : '')
  const isBusy = requestOtpMutation.isPending || resetPasswordMutation.isPending

  return (
    <div className="space-y-6">
      {stage === 'request' ? (
        <ForgetPasswordRequestForm
          currentEmail={currentEmail}
          form={rollForm}
          isSubmitting={isBusy}
          onSubmit={({ roll }) => {
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
          }}
        />
      ) : null}

      {stage === 'verify' ? (
        <ForgetPasswordConfirmForm
          canSubmit={tokens.length > 0}
          email={currentEmail}
          form={resetForm}
          isResetting={resetPasswordMutation.isPending}
          isResending={requestOtpMutation.isPending}
          onBack={() => setStage('request')}
          onResend={() => {
            const roll = rollForm.getValues('roll')

            requestOtpMutation.mutate(
              {
                roll: Number.parseInt(roll, 10),
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
                  setTokens((current) => [...current, data.token].slice(-5))
                  resetForm.setValue('otp', '')
                  toast.success('A fresh recovery code is on the way.')
                },
              }
            )
          }}
          onSubmit={({ otp, password }) => {
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
          }}
          roll={rollForm.getValues('roll')}
        />
      ) : null}
    </div>
  )
}
