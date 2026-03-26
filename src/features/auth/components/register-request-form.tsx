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
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { UseFormReturn } from 'react-hook-form'

type RegisterRequestFormProps = {
  currentEmail: string
  form: UseFormReturn<{
    confirmPassword: string
    gender: 'female' | 'male'
    location: string
    name: string
    password: string
    roll: string
    visibility: 'private' | 'public'
  }>
  isSubmitting: boolean
  onSubmit: (values: {
    confirmPassword: string
    gender: 'female' | 'male'
    location: string
    name: string
    password: string
    roll: string
    visibility: 'private' | 'public'
  }) => void
}

export function RegisterRequestForm({
  currentEmail,
  form,
  isSubmitting,
  onSubmit,
}: RegisterRequestFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-emerald-700 uppercase">
          <Sparkles className="size-3.5" />
          Register
        </div>
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
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={form.handleSubmit(onSubmit)}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
            disabled={isSubmitting}
          >
            <Loading loading={isSubmitting}>Request OTP</Loading>
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
