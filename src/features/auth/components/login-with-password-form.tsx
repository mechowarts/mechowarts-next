import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Spinner } from '@/components/ui/spinner'
import { signInAction } from '@/server/actions/auth.actions'
import { getUserByRoll } from '@/server/actions/users.actions'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
})

function getInitials(name?: string | null) {
  if (!name) {
    return 'MW'
  }

  const [first = '', second = ''] = name.trim().split(/\s+/, 2)

  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase() || 'MW'
}

type LoginWithPasswordFormProps = {
  roll: string
  backToStart: () => void
}

export function LoginWithPasswordForm({
  roll,
  backToStart,
}: LoginWithPasswordFormProps) {
  const router = useRouter()
  const form = useForm<z.infer<typeof passwordSchema>>({
    defaultValues: { password: '' },
    resolver: zodResolver(passwordSchema),
  })
  const signInMutation = useMutation({
    mutationFn: signInAction,
  })

  const userQuery = useQuery({
    enabled: Boolean(roll),
    queryFn: async () => {
      try {
        const user = await getUserByRoll(roll)

        if (!user) {
          toast.info(
            'No account found for that roll. Continue with registration.'
          )
          router.replace(`/register?roll=${roll}`)
          return null
        }

        return user
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Could not load the account.'
        )

        throw error
      }
    },
    queryKey: ['auth-user', roll],
    retry: false,
  })

  return (
    <div className="bg-card rounded-2xl border p-8">
      <div className="mb-8 text-center">
        <h1 className="text-foreground mb-2 text-2xl font-semibold tracking-tight">
          Enter your password
        </h1>
        <p className="text-muted-foreground text-sm">
          We found your account. Enter your password to continue.
        </p>
      </div>

      {userQuery.isLoading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner className="size-8" />
        </div>
      ) : null}

      {!userQuery.isLoading && userQuery.data ? (
        <div className="space-y-6">
          <div className="bg-muted/40 flex items-center gap-4 rounded-xl border p-4">
            <Avatar className="bg-background size-12 border">
              <AvatarImage
                src={userQuery.data.avatar ?? undefined}
                alt={userQuery.data.name}
              />
              <AvatarFallback className="text-foreground bg-secondary text-sm font-semibold">
                {getInitials(userQuery.data.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-foreground font-semibold">
                {userQuery.data.name}
              </p>
              <p className="text-muted-foreground text-sm">Roll {roll}</p>
            </div>
          </div>

          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(({ password }) => {
                signInMutation.mutate(
                  {
                    password,
                    roll: Number.parseInt(roll, 10),
                  },
                  {
                    onError(error) {
                      form.setError('password', {
                        message:
                          error instanceof Error
                            ? error.message
                            : 'Login failed. Please try again.',
                      })
                    },
                    onSuccess() {
                      window.location.assign('/')
                    },
                  }
                )
              })}
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
                        disabled={signInMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={signInMutation.isPending}
              >
                Sign in
                {signInMutation.isPending && <Spinner />}
              </Button>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  asChild
                  type="button"
                  variant="link"
                  className="text-muted-foreground h-auto px-0 text-sm"
                >
                  <Link href={`/forgot-password?roll=${roll}`}>
                    Forgot password?
                  </Link>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="text-muted-foreground h-auto px-0 text-sm"
                  onClick={backToStart}
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
                  Use different roll number
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : null}
    </div>
  )
}
