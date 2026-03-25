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
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { PasswordField } from '@/features/auth/password-field'
import type { RegisterData } from '@/types'
import { useForm } from 'react-hook-form'

interface ProgressiveRegisterStepProps {
  isBusy: boolean
  onRegisterSubmit: (values: RegisterData) => void | Promise<void>
}

export function ProgressiveRegisterStep({
  isBusy,
  onRegisterSubmit,
}: ProgressiveRegisterStepProps) {
  const form = useForm<RegisterData>({
    defaultValues: {
      confirmPassword: '',
      firstName: '',
      gender: '',
      lastName: '',
      password: '',
    },
  })

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-foreground mb-2 text-2xl font-bold">Register</h2>
        <p className="text-muted-foreground">
          Create your account for this roll number.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            await onRegisterSubmit(values)
          })}
          className="space-y-4"
        >
          <div className="flex flex-col gap-2">
            <Label>Name</Label>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="firstName"
                rules={{ required: 'First name is required.' }}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="First Name"
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
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Last Name"
                        disabled={isBusy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="gender"
            rules={{ required: 'Gender is required.' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="border-border bg-muted/50 grid grid-cols-2 gap-3 rounded-xl border p-3"
                    disabled={isBusy}
                  >
                    <Label className="border-border bg-card flex items-center gap-2 rounded-lg border px-4 py-2">
                      <RadioGroupItem value="male" />
                      Male
                    </Label>
                    <Label className="border-border bg-card flex items-center gap-2 rounded-lg border px-4 py-2">
                      <RadioGroupItem value="female" />
                      Female
                    </Label>
                  </RadioGroup>
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordField
                    {...field}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    disabled={isBusy}
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
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordField
                    {...field}
                    placeholder="Re-type your password"
                    autoComplete="new-password"
                    disabled={isBusy}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isBusy}>
            <Loading loading={isBusy}>Register</Loading>
          </Button>
        </form>
      </Form>
    </div>
  )
}
