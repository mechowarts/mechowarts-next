'use client'

import { Spinner } from '@/components/ui/spinner'
import { useAuthStore } from '@/store/use-auth-store'
import { useRouter } from 'next/navigation'
import { PropsWithChildren, useEffect } from 'react'

export default function ProtectedLayout({ children }: PropsWithChildren) {
  const router = useRouter()
  const status = useAuthStore((store) => store.status)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/users')
    }
  }, [status, router])

  if (status === 'authenticated') {
    return children
  }

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return null
}
