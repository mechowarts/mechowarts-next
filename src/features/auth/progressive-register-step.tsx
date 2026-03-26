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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { bloodGroups } from '@/constants/profile'
import { AuthStageTiles } from '@/features/auth/auth-stage-tiles'
import { PasswordField } from '@/features/auth/password-field'
import {
  requestRegisterOtp,
  verifyRegisterOtpAction,
} from '@/server/actions/auth.actions'
import { buildStudentEmail } from '@/utils/roll'
import { useMutation } from '@tanstack/react-query'
import { MailCheck, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type RegisterData = {
  bio: string
  bloodGroup: string
  confirmPassword: string
  facebookId: string
  firstName: string
  location: string
  lastName: string
  otp: string
  password: string
  phone: string
}

interface ProgressiveRegisterStepProps {
  isBusy: boolean
  onRegisterSubmit: (
    values: RegisterData & { tokens: string[] }
  ) => void | Promise<void>
  roll: string
}
type RegisterStage = 'otp' | 'password' | 'info'
const registerStages: Array<{ id: RegisterStage; label: string }> = [
  { id: 'otp', label: 'OTP' },
  { id: 'password', label: 'Password' },
  { id: 'info', label: 'Additional info' },
]
export function ProgressiveRegisterStep({
  isBusy,
  onRegisterSubmit,
  roll,
}: ProgressiveRegisterStepProps) {
  const [stage, setStage] = useState<RegisterStage>('otp')
  const [tokens, setTokens] = useState<string[]>([])
  const [email, setEmail] = useState(buildStudentEmail(roll))
  const parsedRoll = Number.parseInt(roll, 10)
  const form = useForm<RegisterData>({
    defaultValues: {
      bio: '',
      bloodGroup: '',
      confirmPassword: '',
      facebookId: '',
      firstName: '',
      location: '',
      lastName: '',
      otp: '',
      password: '',
      phone: '',
    },
  })
  const requestOtpMutation = useMutation({
    mutationFn: requestRegisterOtp,
  })
  const verifyOtpMutation = useMutation({
    mutationFn: verifyRegisterOtpAction,
  })
  const currentStageIndex = registerStages.findIndex(({ id }) => id === stage)
  const otpValue = form.watch('otp')
  const isOtpReady = otpValue.length === 6 && tokens.length > 0
  const isLocalBusy =
    isBusy || requestOtpMutation.isPending || verifyOtpMutation.isPending
  const stageSummary = useMemo(() => {
    if (tokens.length === 0) {
      return 'Send a one-time code to your student email to begin registration.'
    }

    return `We keep your last ${tokens.length} code${tokens.length === 1 ? '' : 's'} active so the newest email works even if older ones arrive late.`
  }, [tokens.length])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          await onRegisterSubmit({
            ...values,
            tokens,
          })
        })}
        className="space-y-6"
      >
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.28em] text-emerald-700 uppercase">
            <ShieldCheck className="size-3.5" />
            Secure registration
          </div>
          <div>
            <h2 className="text-foreground text-2xl font-bold">
              Create your account
            </h2>
            <p className="text-muted-foreground mt-2">
              Register roll {roll} in three quick steps.
            </p>
          </div>
        </div>

        <AuthStageTiles
          currentIndex={currentStageIndex}
          steps={registerStages}
        />
        {stage === 'otp' ? (
          <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm">
            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-left">
              <div className="rounded-2xl bg-white p-2 text-slate-700 shadow-sm ring-1 ring-slate-200">
                <MailCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Verification email
                </p>
                <p className="text-sm text-slate-600">{email}</p>
                <p className="mt-2 text-sm text-slate-500">{stageSummary}</p>
              </div>
            </div>
            <FormField
              control={form.control}
              name="otp"
              rules={{
                required: 'Enter the six-digit code from your email.',
                validate: (value) =>
                  value.length === 6 || 'Enter the full six-digit code.',
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>One-time code</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLocalBusy}
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
                disabled={isLocalBusy || !Number.isInteger(parsedRoll)}
                onClick={() => {
                  requestOtpMutation.mutate(
                    { rollNumber: parsedRoll },
                    {
                      onSuccess(data) {
                        setEmail(data.email)
                        setTokens((current) =>
                          [...current, data.token].slice(-5)
                        )
                        toast.success(
                          tokens.length === 0
                            ? 'Verification code sent.'
                            : 'A fresh verification code is on the way.'
                        )
                      },
                      onError(error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : 'Could not send the verification code.'
                        )
                      },
                    }
                  )
                }}
              >
                <Loading loading={requestOtpMutation.isPending}>
                  {tokens.length === 0 ? 'Send code' : 'Resend code'}
                </Loading>
              </Button>
              <Button
                type="button"
                disabled={!isOtpReady || isLocalBusy}
                onClick={() => {
                  const otp = form.getValues('otp')

                  verifyOtpMutation.mutate(
                    { otp, tokens },
                    {
                      onSuccess(data) {
                        setEmail(data.email)
                        setStage('password')
                        toast.success('Code verified. Set your password next.')
                      },
                      onError(error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : 'Could not verify the code.'
                        )
                      },
                    }
                  )
                }}
              >
                <Loading loading={verifyOtpMutation.isPending}>
                  Verify and continue
                </Loading>
              </Button>
            </div>
          </div>
        ) : null}
        {stage === 'password' ? (
          <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm">
            <FormField
              control={form.control}
              name="password"
              rules={{
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters long.',
                },
                required: 'Password is required.',
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordField
                      {...field}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      disabled={isLocalBusy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              rules={{
                required: 'Please confirm your password.',
                validate: (value) =>
                  value === form.getValues('password') ||
                  'Passwords do not match.',
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <PasswordField
                      {...field}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      disabled={isLocalBusy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isLocalBusy}
                onClick={() => {
                  setStage('otp')
                }}
              >
                Back
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={isLocalBusy}
                onClick={async () => {
                  const isValid = await form.trigger([
                    'password',
                    'confirmPassword',
                  ])

                  if (isValid) {
                    setStage('info')
                  }
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        ) : null}

        {stage === 'info' ? (
          <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                rules={{ required: 'First name is required.' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nazmus"
                        disabled={isBusy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                rules={{ required: 'Last name is required.' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Sayad" disabled={isBusy} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="bloodGroup"
                rules={{ required: 'Blood group is required.' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood group</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger disabled={isBusy}>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bloodGroups.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                rules={{ required: 'Location is required.' }}
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

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="A short intro for your profile"
                      className="min-h-24 resize-none"
                      disabled={isBusy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        disabled={isBusy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facebookId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="facebook username"
                        disabled={isBusy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isBusy}
                onClick={() => {
                  setStage('password')
                }}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={isBusy}>
                <Loading loading={isBusy}>Create account</Loading>
              </Button>
            </div>
          </div>
        ) : null}
      </form>
    </Form>
  )
}
