'use client'

import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/hooks/use-auth'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PropsWithChildren, useEffect } from 'react'

export default function AuthenticationLayout({ children }: PropsWithChildren) {
  const router = useRouter()
  const { state } = useAuth()
  const isLoading = state === 'loading'
  const isAuthenticated = state === 'authenticated'

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full">
      <section className="flex flex-1 overflow-y-auto px-5 py-8">
        <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 sm:px-0">
          <Logo className="my-8 h-10 w-40 sm:my-10 sm:h-11 sm:w-44 md:my-8 md:h-12 md:w-48" />

          <div className="border-border bg-card mb-8 w-full rounded-3xl border p-8">
            {children}
          </div>

          <div className="mb-4 flex w-full justify-between gap-4">
            <Button
              type="button"
              variant="link"
              className="px-0"
              onClick={() => {
                router.back()
              }}
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Back
            </Button>

            <Button
              type="button"
              variant="link"
              className="px-0"
              onClick={() => {
                router.forward()
              }}
            >
              Forward
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </section>

      <img
        src="/assets/images/side-img.svg"
        alt="Side Banner"
        className="hidden h-screen w-1/2 shrink-0 bg-no-repeat object-cover xl:block"
      />
    </div>
  )
}
