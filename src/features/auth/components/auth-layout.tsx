import { Wrapper } from '@/components/wrapper'
import type { PropsWithChildren } from 'react'

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Wrapper maxWidth="48rem">{children}</Wrapper>
    </main>
  )
}
