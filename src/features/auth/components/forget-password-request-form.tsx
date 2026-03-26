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
import { KeyRound } from 'lucide-react'
import Link from 'next/link'
import { UseFormReturn } from 'react-hook-form'

type ForgetPasswordRequestFormProps = {
  currentEmail: string
  form: UseFormReturn<{ roll: string }>
  isSubmitting: boolean
  onSubmit: (values: { roll: string }) => void
}

export function ForgetPasswordRequestForm({
  currentEmail,
  form,
  isSubmitting,
  onSubmit,
}: ForgetPasswordRequestFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-amber-700 uppercase">
          <KeyRound className="size-3.5" />
          Forgot Password
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Reset your password
          </h1>
          <p className="text-sm leading-6 text-slate-600 sm:text-base">
            Enter your roll number and we will send a recovery code to your
            student email.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={form.handleSubmit(onSubmit)}
        >
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
                    'We send the recovery OTP to your RUET student email.'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="h-11 w-full rounded-full"
            disabled={isSubmitting}
          >
            <Loading loading={isSubmitting}>Request OTP</Loading>
          </Button>

          <p className="text-center text-sm text-slate-500">
            Remembered it? Go back to{' '}
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
