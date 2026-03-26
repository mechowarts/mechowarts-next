import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'
import { isValidRollNumber } from '@/utils/roll'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { RollNumberInput } from './roll-number-input'

const rollSchema = z.object({
  roll: z
    .string()
    .trim()
    .refine(isValidRollNumber, 'Enter a valid roll number.'),
})

type LoginStartFormProps = {
  onSubmit: (values: z.infer<typeof rollSchema>) => void
}

export function LoginStartForm({ onSubmit }: LoginStartFormProps) {
  const form = useForm<z.infer<typeof rollSchema>>({
    defaultValues: { roll: '' },
    resolver: zodResolver(rollSchema),
  })

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500">
            Enter your roll number to sign in
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
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

            <div className="space-y-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                size="lg"
                className="w-full"
              >
                Continue
                {form.formState.isSubmitting ? (
                  <Spinner />
                ) : (
                  <HugeiconsIcon icon={ArrowRight01Icon} />
                )}
              </Button>

              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-12 bg-slate-200" />
                <span className="text-xs text-slate-400">or</span>
                <span className="h-px w-12 bg-slate-200" />
              </div>

              <p className="text-center text-sm text-slate-500">
                New student?{' '}
                <Link
                  href="/register"
                  className="font-medium text-slate-900 underline-offset-4 transition-colors hover:text-indigo-600 hover:underline"
                >
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>

      <p className="mt-6 text-center text-[11px] text-slate-400">
        Format: 7 digits (e.g., 2108061)
      </p>
    </div>
  )
}
