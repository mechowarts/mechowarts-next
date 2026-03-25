import { resetPassword } from '@/api/http/auth'
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
import { PasswordField } from '@/features/auth/password-field'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const form = useForm({
    defaultValues: {
      confirmPassword: '',
      password: '',
      rollNumber: searchParams.get('roll') || '',
    },
  })
  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
  })

  return (
    <>
      <h2 className="text-foreground mb-2 text-center text-2xl font-bold">
        Reset Password
      </h2>
      <p className="text-muted-foreground mb-6 text-center">
        Enter your roll number and choose a new password.
      </p>

      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(({ password, rollNumber }) => {
            const parsedRoll = Number.parseInt(rollNumber, 10)

            resetPasswordMutation.mutate(
              { password, rollNumber: parsedRoll },
              {
                onSuccess() {
                  toast.success('Password reset successful. Please sign in.')
                  router.push(`/authentication/login/${parsedRoll}`)
                },
                onError(error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : 'Failed to reset password.'
                  )
                },
              }
            )
          })}
        >
          <FormField
            control={form.control}
            name="rollNumber"
            rules={{
              required: 'Roll number is required.',
              validate: (value) => {
                const parsedRoll = Number.parseInt(value, 10)

                return (
                  (Number.isInteger(parsedRoll) && parsedRoll > 0) ||
                  'Please enter a valid roll number.'
                )
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="rollNumber">Roll Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="rollNumber"
                    type="text"
                    inputMode="numeric"
                    value={field.value}
                    onChange={(event) =>
                      field.onChange(event.target.value.replace(/\D/g, ''))
                    }
                    placeholder="Enter your roll number"
                    disabled={resetPasswordMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                <FormLabel htmlFor="newPassword">New Password</FormLabel>
                <FormControl>
                  <PasswordField
                    {...field}
                    id="newPassword"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    disabled={resetPasswordMutation.isPending}
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
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters long.',
              },
              required: 'Please confirm your password.',
              validate: (value) =>
                value === form.getValues('password') ||
                'Passwords do not match.',
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="confirmPassword">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <PasswordField
                    {...field}
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    disabled={resetPasswordMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="w-full"
            type="submit"
            disabled={resetPasswordMutation.isPending}
          >
            <Loading loading={resetPasswordMutation.isPending}>
              Reset Password
            </Loading>
          </Button>

          <Button
            className="w-full"
            variant="ghost"
            type="button"
            disabled={resetPasswordMutation.isPending}
            onClick={() => router.push('/authentication')}
          >
            Back to Sign In
          </Button>
        </form>
      </Form>
    </>
  )
}
