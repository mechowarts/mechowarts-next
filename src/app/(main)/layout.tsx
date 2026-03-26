'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { sidebarLinks } from '@/constants/navigation'
import { cn } from '@/lib/utils'
import { signOutAction } from '@/server/actions/auth.actions'
import { useAuthStore } from '@/store/use-auth-store'
import { Logout01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { PropsWithChildren } from 'react'

export default function MainLayout({ children }: PropsWithChildren) {
  const router = useRouter()
  const pathname = usePathname()

  const user = useAuthStore((store) => store.user)
  const status = useAuthStore((store) => store.status)

  const signOutMutation = useMutation({
    mutationFn: signOutAction,
  })

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="w-full md:flex">
      <section className="border-border bg-background/95 sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-3 transition-transform duration-300 hover:scale-105"
          >
            <Logo className="h-8 w-32 sm:h-9 sm:w-36 md:h-10 md:w-40" />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  signOutMutation.mutate(undefined, {
                    onSuccess() {
                      window.location.assign('/')
                    },
                  })
                }}
              >
                <HugeiconsIcon icon={Logout01Icon} className="h-5 w-5" />
              </Button>

              {typeof user.roll === 'number' ? (
                <Link
                  href={`/profile/${user.roll}`}
                  className="flex items-center gap-3"
                >
                  <img
                    src={user.avatar ?? '/assets/icons/profile-placeholder.svg'}
                    alt="profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </Link>
              ) : (
                <img
                  src="/assets/icons/profile-placeholder.svg"
                  alt="profile"
                  className="h-8 w-8 rounded-full object-cover"
                />
              )}
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                router.push('/login')
              }}
            >
              Log In
            </Button>
          )}
        </div>
      </section>

      <AppSidebar />

      <section className="flex h-full flex-1">{children}</section>

      <section className="border-border bg-background/95 fixed right-0 bottom-0 left-0 z-40 flex items-center justify-around border-t px-4 py-2 backdrop-blur md:hidden">
        {sidebarLinks
          .filter((link) => link.isOnBottomBar)
          .map((link) => {
            const isActive = pathname === link.route

            if (link.isPrivate && !user) {
              return null
            }

            return (
              <Link
                key={link.label}
                href={link.route}
                className={cn(
                  'group text-foreground hover:bg-accent hover:text-accent-foreground flex h-16 w-20 flex-col items-center gap-1 rounded-[10px] p-2 text-xs transition',
                  isActive && 'bg-primary text-primary-foreground'
                )}
              >
                <HugeiconsIcon icon={link.icon} className="h-6 w-6" />

                <span className="text-xs">{link.label}</span>
              </Link>
            )
          })}
      </section>
    </div>
  )
}
