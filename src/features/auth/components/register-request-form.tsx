import { Button } from '@/components/ui/button'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { requestRegisterOTPAction } from '@/server/actions/auth.actions'
import { isValidRollNumber } from '@/utils/roll'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { RollNumberInput } from './roll-number-input'

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

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="bg-card rounded-2xl border p-8">
        <div className="mb-8 text-center">
          <h1 className="text-foreground mb-2 text-2xl font-semibold tracking-tight">
            Create your MechoWarts account
          </h1>
          <p className="text-muted-foreground text-sm">
            Complete your basic profile details, then verify your student email
            with a one-time code.
          </p>
        </div>

        <Form {...form}>
          <form
            className="space-y-5"
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
                    toast.success(
                      'Verification code sent to your student email.'
                    )
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Your full name"
                        disabled={requestOtpMutation.isPending}
                      />
                    </FormControl>
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
                        placeholder="Your location"
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
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Visibility</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    <FormLabel>Confirm Password</FormLabel>
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

            <div className="space-y-4 pt-2">
              <Button
                size="lg"
                type="submit"
                disabled={requestOtpMutation.isPending}
                className="w-full"
              >
                Request OTP
                {requestOtpMutation.isPending && <Spinner />}
              </Button>

              <p className="text-muted-foreground text-center text-sm">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-foreground hover:text-primary font-medium underline-offset-4 transition-colors hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
