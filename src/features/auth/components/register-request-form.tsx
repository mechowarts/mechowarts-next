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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { requestRegisterOTPAction } from '@/server/actions/auth.actions'
import { buildStudentEmail, isValidRollNumber } from '@/utils/roll'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const registerDetailsSchema = z
  .object({
    confirmPassword: z.string(),
    gender: z.enum(['female', 'male'], { error: 'Select a gender.' }),
    location: z.string().trim().min(1, 'Location is required.'),
    name: z.string().trim().min(1, 'Name is required.'),
    password: z.string().min(6, 'Password must be at least 6 characters long.'),
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

export type RegisterFlowData = z.infer<typeof registerDetailsSchema> & {
  tokens: string[]
}

type RegisterRequestFormProps = {
  defaultValues?: RegisterFlowData
  onSubmit: (values: RegisterFlowData) => void
}

export function RegisterRequestForm({
  defaultValues,
  onSubmit,
}: RegisterRequestFormProps) {
  const router = useRouter()
  const form = useForm<z.infer<typeof registerDetailsSchema>>({
    defaultValues: {
      confirmPassword: defaultValues?.confirmPassword ?? '',
      gender: defaultValues?.gender ?? 'male',
      location: defaultValues?.location ?? '',
      name: defaultValues?.name ?? '',
      password: defaultValues?.password ?? '',
      roll: defaultValues?.roll ?? '',
      visibility: defaultValues?.visibility ?? 'public',
    },
    resolver: zodResolver(registerDetailsSchema),
  })
  const requestOtpMutation = useMutation({
    mutationFn: requestRegisterOTPAction,
  })
  const currentRoll = form.watch('roll')
  const currentEmail = isValidRollNumber(currentRoll)
    ? buildStudentEmail(currentRoll)
    : ''

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Create your MechoWarts account
          </h1>
          <p className="text-sm leading-6 text-slate-600 sm:text-base">
            Complete your basic profile details, then verify your student email
            with a one-time code.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6"
          onSubmit={form.handleSubmit((values) => {
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
                  onSubmit({
                    ...values,
                    tokens: [data.token],
                  })
                  router.replace(`/register?roll=${values.roll}`)
                  toast.success('Verification code sent to your student email.')
                },
              }
            )
          })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
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
                      'We send the OTP to your RUET student email address.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nazmus Sayad"
                      disabled={requestOtpMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={requestOtpMutation.isPending}
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
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Chittagong"
                      disabled={requestOtpMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile visibility</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={requestOtpMutation.isPending}
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
                    Public profiles are visible in the community directory.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              The verification code will be sent to{' '}
              <span className="font-semibold text-slate-900">
                {currentEmail || 'your RUET student email'}
              </span>
              .
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      autoComplete="new-password"
                      placeholder="Create a password"
                      disabled={requestOtpMutation.isPending}
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
                      disabled={requestOtpMutation.isPending}
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
            disabled={requestOtpMutation.isPending}
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
    </div>
  )
}
