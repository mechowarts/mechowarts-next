'use client'

import {
  clearSessionCookie,
  getAuthUser,
  type AuthUser,
} from '@/server/helpers/session'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

export const useAuthStore = create(
  combine(
    {
      authLoaded: false,

      status: 'loading' as 'authenticated' | 'loading' | 'unauthenticated',
      user: null as AuthUser | null,
    },
    (set, get) => ({
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

      async signOut() {
        await clearSessionCookie()
        set({
          authLoaded: true,
          status: 'unauthenticated',
          user: null,
        })
      },
    })
  )
)
