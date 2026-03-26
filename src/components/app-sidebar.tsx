'use client'

import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { sidebarLinks } from '@/constants/navigation'
import { cn } from '@/lib/utils'
import { signOutAction } from '@/server/actions/auth.actions'
import { useAuthStore } from '@/store/use-auth-store'
import { Logout01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FaSignInAlt } from 'react-icons/fa'

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const status = useAuthStore((store) => store.status)
  const user = useAuthStore((store) => store.user)
  const isAuthenticated = status === 'authenticated'

  const signOutMutation = useMutation({
    mutationFn: signOutAction,
  })

  return (
    <nav className="border-border bg-sidebar sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r px-5 py-6 md:flex">
      <div className="flex shrink-0 flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-3 transition-transform duration-300 hover:scale-105"
        >
          <Logo className="h-8 w-36" />
        </Link>

        {isAuthenticated && user && typeof user.roll === 'number' ? (
          <Link
            href={`/profile/${user.roll}`}
            className="flex items-center gap-3"
          >
            <img
              src={user.avatar ?? '/assets/icons/profile-placeholder.svg'}
              alt="profile"
              className="h-14 w-14 rounded-full object-cover"
            />

            <div className="flex flex-col">
              <p className="text-foreground text-sm font-semibold">
                {user.name}
              </p>
              <p className="text-muted-foreground text-xs">@{user.roll}</p>
            </div>
          </Link>
        ) : null}
      </div>

      <div className="mt-6 flex-1 overflow-y-auto pr-2">
        <ul className="flex flex-col gap-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.route

            if (link.isPrivate && !isAuthenticated) {
              return null
            }

            return (
              <li key={link.label}>
                <Link
                  href={link.route}
                  className={cn(
                    'flex items-center gap-4 rounded-lg px-4 py-3 font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'bg-card text-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <HugeiconsIcon
                    icon={link.icon}
                    className="h-6 w-6 shrink-0"
                  />

                  <span className="ml-1">{link.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="flex shrink-0 flex-row gap-2 pt-4">
        {isAuthenticated ? (
          <Button
            variant="ghost"
            className="text-foreground h-12 flex-1"
            onClick={() => {
              signOutMutation.mutate(undefined, {
                onSuccess() {
                  window.location.assign('/')
                },
              })
            }}
          >
            <HugeiconsIcon icon={Logout01Icon} className="h-5 w-5" />
            <p className="text-sm font-medium">Logout</p>
          </Button>
        ) : (
          <Button
            variant="outline"
            className="flex flex-1 items-center justify-center gap-2 py-6"
            onClick={() => {
              router.push('/login')
            }}
          >
            <FaSignInAlt className="h-5 w-5" />
            <p className="text-sm font-medium">Log In</p>
          </Button>
        )}
      </div>
    </nav>
  )
}
