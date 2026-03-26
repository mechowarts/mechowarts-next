import { Wrapper } from '@/components/wrapper'
import type { PropsWithChildren } from 'react'

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className="flex min-h-screen flex-col">
      <nav className="sticky top-0 w-full">sfdasdfasdf</nav>

      <div className="flex flex-1 items-center justify-center p-4">
        <Wrapper maxWidth="48rem">{children}</Wrapper>
      </div>
    </main>
  )
}
