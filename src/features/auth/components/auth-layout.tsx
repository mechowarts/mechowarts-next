import { Logo } from '@/components/brand/logo'
import { Wrapper } from '@/components/wrapper'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import type { PropsWithChildren } from 'react'

export function AuthLayout({
  children,
  size = 'md',
}: PropsWithChildren<{ size?: 'sm' | 'md' | 'lg' }>) {
  return (
    <main className="flex min-h-screen flex-col">
      <nav className="bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur">
        <Wrapper className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo className="h-8 w-auto" />
          </Link>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            Back to home
          </Link>
        </Wrapper>
      </nav>

      <div className="flex flex-1 items-center justify-center p-4">
        <Wrapper
          maxWidth={size === 'sm' ? '24rem' : size === 'md' ? '28rem' : '32rem'}
        >
          {children}
        </Wrapper>
      </div>
    </main>
  )
}
