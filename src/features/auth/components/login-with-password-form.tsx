import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { UseFormReturn } from 'react-hook-form'

function getInitials(name?: string | null) {
  if (!name) {
    return 'MW'
  }

  const [first = '', second = ''] = name.trim().split(/\s+/, 2)

  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase() || 'MW'
}

type LoginWithPasswordFormProps = {
  avatarUrl?: string | null
  form: UseFormReturn<{ password: string }>
  isLoading: boolean
  isSubmitting: boolean
  name?: string | null
  onBack: () => void
  onSubmit: (values: { password: string }) => void
  roll: string
}

export function LoginWithPasswordForm({
  avatarUrl,
  form,
  isLoading,
  isSubmitting,
  name,
  onBack,
  onSubmit,
  roll,
}: LoginWithPasswordFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-slate-700 uppercase">
          <ShieldCheck className="size-3.5" />
          Login
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Enter your password
          </h1>
          <p className="text-sm leading-6 text-slate-600 sm:text-base">
            We found your account. Confirm your password to finish signing in.
          </p>
        </div>
      </div>

      <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          className="-ml-3 h-auto justify-start px-3 text-slate-600 hover:text-slate-900"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
          Change roll number
        </Button>

        {isLoading ? (
          <div className="flex min-h-52 items-center justify-center">
            <Spinner className="size-8" />
          </div>
        ) : null}

        {!isLoading && name ? (
          <>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Avatar className="size-14 border border-slate-200 bg-white">
                <AvatarImage src={avatarUrl ?? undefined} alt={name} />
                <AvatarFallback className="bg-slate-100 text-sm font-semibold text-slate-700">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-left">
                <p className="text-xs font-medium tracking-[0.2em] text-slate-500 uppercase">
                  Account found
                </p>
                <p className="text-lg font-semibold text-slate-950">{name}</p>
                <p className="text-sm text-slate-600">Roll {roll}</p>
              </div>
            </div>

            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
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
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="h-11 w-full rounded-full"
                  disabled={isSubmitting}
                >
                  <Loading loading={isSubmitting}>Sign in</Loading>
                </Button>

                <Button
                  asChild
                  type="button"
                  variant="link"
                  className="mx-auto flex h-auto px-0 text-sm text-slate-600"
                >
                  <Link href={`/forgot-password?roll=${roll}`}>
                    <KeyRound className="size-4" />
                    Forgot password?
                  </Link>
                </Button>
              </form>
            </Form>
          </>
        ) : null}
      </div>
    </div>
  )
}
