import '@/styles/index.css'

import { Providers } from '@/app/providers'
import { cn } from '@/lib/utils'
import { Metadata } from 'next'
import { Fira_Code, Inter } from 'next/font/google'
import { PropsWithChildren } from 'react'

const fontSans = Inter({
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-variable',
})

const fontMono = Fira_Code({
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono-variable',
})

export const metadata: Metadata = {
  title: 'MechoWarts',
  description: 'MechoWarts social platform',
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(fontSans.variable, fontMono.variable)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
