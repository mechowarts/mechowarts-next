import { Button, Loading } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordField } from '@/features/auth/password-field'
import { useForm } from 'react-hook-form'

interface LoginFormProps {
  isLoading: boolean
  onForgot?: () => void
  onSubmit: (values: { password: string }) => void | Promise<void>
}

export function LoginForm({ isLoading, onForgot, onSubmit }: LoginFormProps) {
  const form = useForm({
    defaultValues: {
      password: '',
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit(values)
        })}
        className="space-y-4"
      >
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          <Loading loading={isLoading}>Sign In</Loading>
        </Button>

        {onForgot ? (
          <Button
            type="button"
            variant="link"
            className="mt-2 w-full"
            onClick={onForgot}
            disabled={isLoading}
          >
            Forgot password?
          </Button>
        ) : null}
      </form>
    </Form>
  )
}
