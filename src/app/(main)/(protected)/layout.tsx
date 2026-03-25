'use client'

import { useAuth } from '@/hooks/use-auth'
import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'

export default function ProtectedLayout({ children }: PropsWithChildren) {
  const { state } = useAuth()
  const isAuthenticated = state === 'authenticated'

  if (isAuthenticated) {
    return children
  }

  return redirect('/all-users')
}
