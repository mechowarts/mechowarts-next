'use client'

import { getAuthUser, type AuthUser } from '@/server/helpers/session'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

type AuthStatus = 'authenticated' | 'loading' | 'unauthenticated'

type AuthActions = {
  init: () => Promise<void>
  refetch: () => Promise<void>
}

export const useAuthStore = create(
  combine(
    {
      authLoaded: false,

      status: 'loading' as AuthStatus,
      user: null as AuthUser | null,
    },
    (set, get): AuthActions => ({
      async init() {
        if (get().authLoaded) return

        try {
          const user = await getAuthUser()
          if (!user) throw new Error('No session found')

          set({
            authLoaded: true,
            status: 'authenticated',
            user: user,
          })
        } catch {
          set({
            authLoaded: true,
            status: 'unauthenticated',
            user: null,
          })
        }
      },

      async refetch() {
        try {
          const user = await getAuthUser()
          if (!user) throw new Error('No session found')

          set({
            authLoaded: true,
            status: 'authenticated',
            user: user,
          })
        } catch {
          set({
            authLoaded: true,
            status: 'unauthenticated',
            user: null,
          })
        }
      },
    })
  )
)
