'use client'

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

  return null
}
