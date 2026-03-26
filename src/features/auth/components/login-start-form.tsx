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
    <>
      <div className="bg-card rounded-2xl border p-8">
        <div className="mb-8 text-center">
          <h1 className="text-foreground mb-2 text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-muted-foreground text-sm">
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
                size="lg"
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                Continue
                {form.formState.isSubmitting ? (
                  <Spinner />
                ) : (
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="size-4"
                    strokeWidth={2.5}
                  />
                )}
              </Button>

              <div className="flex items-center justify-center gap-3">
                <span className="bg-border h-px w-12" />
                <span className="text-muted-foreground text-xs">or</span>
                <span className="bg-border h-px w-12" />
              </div>

              <p className="text-muted-foreground text-center text-sm">
                New student?{' '}
                <Link
                  href="/register"
                  className="text-foreground hover:text-primary font-medium underline-offset-4 transition-colors hover:underline"
                >
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>

      <p className="text-muted-foreground mt-6 text-center text-[11px]">
        Format: 7 digits (e.g., 2108061)
      </p>
    </>
  )
}
