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
import { isValidRollNumber } from '@/utils/roll'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-slate-700 uppercase">
          <ShieldCheck className="size-3.5" />
          Login
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Sign in with your roll number
          </h1>
          <p className="text-sm leading-6 text-slate-600 sm:text-base">
            Enter your RUET mechanical roll number to continue to password sign
            in.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 "
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
                  />
                </FormControl>
                <FormDescription>
                  Use your full RUET mechanical engineering roll.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="h-11 w-full rounded-full">
            <Loading loading={false}>Continue</Loading>
          </Button>

          <p className="text-center text-sm text-slate-500">
            New here? Go to{' '}
            <Link
              href="/register"
              className="font-medium text-slate-900 underline-offset-4 hover:underline"
            >
              registration
            </Link>
            .
          </p>
        </form>
      </Form>
    </div>
  )
}
