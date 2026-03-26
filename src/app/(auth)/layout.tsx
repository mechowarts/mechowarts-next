'use client'

import { Spinner } from '@/components/ui/spinner'
import { useAuthStore } from '@/store/use-auth-store'
import { redirect, RedirectType } from 'next/navigation'
import { PropsWithChildren } from 'react'

export default function AuthenticationLayout({ children }: PropsWithChildren) {
  const status = useAuthStore((store) => store.status)

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (status === 'authenticated') {
    return redirect('/', RedirectType.replace)
  }

  return children
}
