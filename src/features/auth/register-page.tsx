import { RegisterConfirmForm } from '@/features/auth/components/register-confirm-form'
import { RegisterRequestForm } from '@/features/auth/components/register-request-form'
import {
  confirmRegisterOTPAction,
  requestRegisterOTPAction,
} from '@/server/actions/auth.actions'
import { buildStudentEmail, isValidRollNumber } from '@/utils/roll'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const registerDetailsSchema = z
  .object({
    confirmPassword: z.string(),
    gender: z.enum(['female', 'male'], { error: 'Select a gender.' }),
    location: z.string().trim().min(1, 'Location is required.'),
    name: z.string().trim().min(1, 'Name is required.'),
    password: z.string().min(8, 'Password must be at least 8 characters long.'),
    roll: z
      .string()
      .trim()
      .refine(isValidRollNumber, 'Enter a valid roll number.'),
    visibility: z.enum(['public', 'private'], {
      error: 'Select profile visibility.',
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

const otpSchema = z.object({
  otp: z.string().length(6, 'Enter the six-digit code.'),
})

export function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchRoll = searchParams.get('roll') ?? ''
  const initialRoll = useMemo(() => searchRoll, [searchRoll])
  const [stage, setStage] = useState<'details' | 'otp'>('details')
  const [tokens, setTokens] = useState<string[]>([])
  const [email, setEmail] = useState(
    initialRoll ? buildStudentEmail(initialRoll) : ''
  )

  const detailsForm = useForm<z.infer<typeof registerDetailsSchema>>({
    defaultValues: {
      confirmPassword: '',
      gender: 'male',
      location: '',
      name: '',
      password: '',
      roll: initialRoll,
      visibility: 'public',
    },
    resolver: zodResolver(registerDetailsSchema),
  })
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    defaultValues: { otp: '' },
    resolver: zodResolver(otpSchema),
  })

  const requestOtpMutation = useMutation({
    mutationFn: requestRegisterOTPAction,
  })
  const registerMutation = useMutation({
    mutationFn: confirmRegisterOTPAction,
  })

  const currentRoll = detailsForm.watch('roll')
  const currentEmail =
    email ||
    (isValidRollNumber(currentRoll) ? buildStudentEmail(currentRoll) : '')
  const isBusy = requestOtpMutation.isPending || registerMutation.isPending

  return (
    <div className="space-y-6">
      {stage === 'details' ? (
        <RegisterRequestForm
          currentEmail={currentEmail}
          form={detailsForm}
          isSubmitting={isBusy}
          onSubmit={(values) => {
            requestOtpMutation.mutate(
              {
                roll: Number.parseInt(values.roll, 10),
              },
              {
                onError(error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : 'Could not send the verification code.'
                  )
                },
                onSuccess(data) {
                  setEmail(data.email)
                  setTokens((current) => [...current, data.token].slice(-5))
                  otpForm.reset({ otp: '' })
                  setStage('otp')
                  router.replace(`/register?roll=${values.roll}`)
                  toast.success('Verification code sent to your student email.')
                },
              }
            )
          }}
        />
      ) : null}

      {stage === 'otp' ? (
        <RegisterConfirmForm
          canSubmit={tokens.length > 0}
          email={currentEmail}
          form={otpForm}
          isRegistering={registerMutation.isPending}
          isResending={requestOtpMutation.isPending}
          name={detailsForm.getValues('name')}
          onBack={() => setStage('details')}
          onResend={() => {
            const values = detailsForm.getValues()

            requestOtpMutation.mutate(
              {
                roll: Number.parseInt(values.roll, 10),
              },
              {
                onError(error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : 'Could not resend the verification code.'
                  )
                },
                onSuccess(data) {
                  setEmail(data.email)
                  setTokens((current) => [...current, data.token].slice(-5))
                  otpForm.reset({ otp: '' })
                  toast.success('A fresh verification code is on the way.')
                },
              }
            )
          }}
          onSubmit={({ otp }) => {
            const values = detailsForm.getValues()

            registerMutation.mutate(
              {
                gender: values.gender,
                location: values.location,
                name: values.name,
                otp,
                password: values.password,
                roll: Number.parseInt(values.roll, 10),
                tokens,
                visibility: values.visibility,
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
          }}
          roll={detailsForm.getValues('roll')}
        />
      ) : null}
    </div>
  )
}
