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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PasswordField } from '@/features/auth/password-field'
import {
  registerWithOtp,
  requestRegisterOtp,
} from '@/server/actions/auth.actions'
import { buildStudentEmail, isValidRollNumber } from '@/utils/roll'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, MailCheck, Sparkles } from 'lucide-react'
import Link from 'next/link'
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
    mutationFn: requestRegisterOtp,
  })
  const registerMutation = useMutation({
    mutationFn: registerWithOtp,
  })

  const currentRoll = detailsForm.watch('roll')
  const currentEmail =
    email ||
    (isValidRollNumber(currentRoll) ? buildStudentEmail(currentRoll) : '')
  const isBusy = requestOtpMutation.isPending || registerMutation.isPending

  return (
    <div className="space-y-6">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-emerald-700 uppercase">
          <Sparkles className="size-3.5" />
          Register
        </div>
        <div>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight">
            Create your MechoWarts account
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-6 sm:text-base">
            Fill in the basics once, request an email OTP, and we sign you in as
            soon as verification is complete.
          </p>
        </div>
      </div>

      {stage === 'details' ? (
        <Form {...detailsForm}>
          <form
            className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
            onSubmit={detailsForm.handleSubmit((values) => {
              requestOtpMutation.mutate(
                {
                  rollNumber: Number.parseInt(values.roll, 10),
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
                    toast.success(
                      'Verification code sent to your student email.'
                    )
                  },
                }
              )
            })}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={detailsForm.control}
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
                        disabled={isBusy}
                      />
                    </FormControl>
                    <FormDescription>
                      {currentEmail ||
                        'We use your RUET student email for OTP delivery.'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={detailsForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nazmus Sayad"
                        disabled={isBusy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={detailsForm.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isBusy}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={detailsForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Chittagong"
                        disabled={isBusy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={detailsForm.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isBusy}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Public profiles are visible to everyone in the directory.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                The OTP will be sent to{' '}
                <span className="font-semibold text-slate-900">
                  {currentEmail || 'your RUET student email'}
                </span>
                .
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={detailsForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordField
                        {...field}
                        autoComplete="new-password"
                        placeholder="Create a password"
                        disabled={isBusy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={detailsForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <PasswordField
                        {...field}
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

            <Button
              type="submit"
              className="h-11 w-full rounded-full"
              disabled={isBusy}
            >
              <Loading loading={requestOtpMutation.isPending}>
                Request OTP
              </Loading>
            </Button>

            <p className="text-center text-sm text-slate-500">
              Already have an account? Go back to{' '}
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
      ) : null}

      {stage === 'otp' ? (
        <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <Button
            type="button"
            variant="ghost"
            className="-ml-3 h-auto justify-start px-3 text-slate-600 hover:text-slate-900"
            onClick={() => setStage('details')}
          >
            <ArrowLeft className="size-4" />
            Back to details
          </Button>

          <div className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left">
            <div className="rounded-2xl bg-white p-2 text-slate-700 shadow-sm ring-1 ring-slate-200">
              <MailCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Enter the OTP we sent
              </p>
              <p className="mt-1 text-sm text-slate-600">{currentEmail}</p>
            </div>
          </div>

          <Form {...otpForm}>
            <form
              className="space-y-5"
              onSubmit={otpForm.handleSubmit(({ otp }) => {
                const values = detailsForm.getValues()

                registerMutation.mutate(
                  {
                    gender: values.gender,
                    location: values.location,
                    name: values.name,
                    otp,
                    password: values.password,
                    rollNumber: Number.parseInt(values.roll, 10),
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
              })}
            >
              <FormField
                control={otpForm.control}
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
                    const values = detailsForm.getValues()

                    requestOtpMutation.mutate(
                      {
                        rollNumber: Number.parseInt(values.roll, 10),
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
                          setTokens((current) =>
                            [...current, data.token].slice(-5)
                          )
                          otpForm.reset({ otp: '' })
                          toast.success(
                            'A fresh verification code is on the way.'
                          )
                        },
                      }
                    )
                  }}
                >
                  <Loading loading={requestOtpMutation.isPending}>
                    Resend OTP
                  </Loading>
                </Button>

                <Button
                  type="submit"
                  className="rounded-full"
                  disabled={isBusy || tokens.length === 0}
                >
                  <Loading loading={registerMutation.isPending}>
                    Verify and create account
                  </Loading>
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : null}
    </div>
  )
}
