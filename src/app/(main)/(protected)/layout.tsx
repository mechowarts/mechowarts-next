'use client'

import { useAuthStore } from '@/store/use-auth-store'
import { redirect, RedirectType } from 'next/navigation'
import { PropsWithChildren } from 'react'

export default function ProtectedLayout({ children }: PropsWithChildren) {
  const status = useAuthStore((store) => store.status)

  if (status === 'authenticated') {
    return children
  }

  if (status === 'loading') {
    return null
  }

  return redirect('/all-users', RedirectType.replace)
}
