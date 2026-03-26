'use client'

import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/use-auth-store'
import { KeyRound, ShieldCheck, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { redirect, RedirectType, usePathname } from 'next/navigation'
import { PropsWithChildren } from 'react'

const authLinks = [
  {
    description: 'Start with roll lookup, then sign in',
    href: '/login',
    icon: ShieldCheck,
    label: 'Login',
  },
  {
    description: 'Create an account and verify with OTP',
    href: '/register',
    icon: UserPlus,
    label: 'Register',
  },
  {
    description: 'Recover access with OTP and a new password',
    href: '/forgot-password',
    icon: KeyRound,
    label: 'Forget Password',
  },
]

export default function AuthenticationLayout({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const status = useAuthStore((store) => store.status)
  const isLoading = status === 'loading'
  const isRecoveryPage = pathname.startsWith('/forgot-password')

  if (status === 'authenticated') {
    return redirect('/', RedirectType.replace)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(248,250,252,1)_42%,_rgba(226,232,240,0.85)_100%)]">
      <section className="flex flex-1 overflow-y-auto px-5 py-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col px-4 sm:px-0">
          <div className="mb-6 flex flex-col gap-5 rounded-[32px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Logo className="h-10 w-40 sm:h-11 sm:w-44" />
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                  {isRecoveryPage
                    ? 'Recover access securely with an OTP, choose a new password, and get back in without extra steps.'
                    : 'Use your RUET roll to move cleanly between login and registration without losing your place.'}
                </p>
              </div>

              <Button asChild variant="outline" className="rounded-full px-5">
                <Link href="/">Back to home</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {authLinks.map((item) => {
                const Icon = item.icon
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-3xl border p-4 transition-all',
                      isActive
                        ? 'border-slate-900 bg-slate-950 text-white shadow-[0_20px_50px_-28px_rgba(15,23,42,0.8)]'
                        : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-white'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'rounded-2xl p-2',
                          isActive ? 'bg-white/10' : 'bg-white text-slate-900'
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p
                          className={cn(
                            'mt-1 text-sm leading-6',
                            isActive ? 'text-slate-300' : 'text-slate-500'
                          )}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="border-border bg-card mb-6 w-full rounded-[32px] border p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] sm:p-8">
            {children}
          </div>

          <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>Need a clean start? Return to the main auth flow at any time.</p>
            <Button asChild variant="link" className="h-auto px-0 text-sm">
              <Link href="/login">Start over</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="relative hidden w-[44%] shrink-0 overflow-hidden border-l border-slate-200 bg-slate-950 xl:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.18),_transparent_36%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(2,6,23,1))]" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <div className="max-w-sm space-y-4">
            <p className="text-xs font-semibold tracking-[0.3em] text-slate-400 uppercase">
              MechoWarts access
            </p>
            <h2 className="text-4xl leading-tight font-semibold">
              Clear auth screens, one flow per job, and no dead ends.
            </h2>
            <p className="text-base leading-7 text-slate-300">
              Login starts with roll lookup, registration carries the roll into
              the form automatically, and recovery signs you back in after the
              reset is done.
            </p>
          </div>

          <div className="space-y-3 rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm font-semibold text-white">Now available</p>
            <p className="text-sm leading-7 text-slate-300">
              Dedicated login, register, and password recovery pages with OTP
              verification built around your student email.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
