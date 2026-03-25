import { auth } from '@/lib/auth'
import { ApiError } from '@/server/http'
import { headers } from 'next/headers'

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function requireSession() {
  const session = await getSession()

  if (!session) {
    throw new ApiError(401, 'Unauthorized.')
  }

  return session
}
