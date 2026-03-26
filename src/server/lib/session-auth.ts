import 'server-only'

import { serverEnv } from '@/env.server'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const sessionCookieName = 'mechowarts_session'
const sessionDurationSeconds = 60 * 60 * 24 * 30
const jwtSecret = new TextEncoder().encode(serverEnv.JWT_SECRET)

type SessionTokenPayload = {
  pca: number | null
  sub: string
}

export async function createSessionToken(payload: SessionTokenPayload) {
  return new SignJWT({ pca: payload.pca })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${sessionDurationSeconds}s`)
    .setSubject(payload.sub)
    .sign(jwtSecret)
}

export async function readSessionToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get(sessionCookieName)?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, jwtSecret)
    const userId = typeof payload.sub === 'string' ? payload.sub : null
    const passwordChangedAt =
      typeof payload.pca === 'number'
        ? payload.pca
        : payload.pca === null
          ? null
          : undefined
    const issuedAt = typeof payload.iat === 'number' ? payload.iat : null

    if (!userId || !issuedAt || passwordChangedAt === undefined) {
      return null
    }

    return {
      issuedAt,
      passwordChangedAt,
      userId,
    }
  } catch {
    return null
  }
}

export async function setSessionCookie(payload: SessionTokenPayload) {
  const token = await createSessionToken(payload)
  const cookieStore = await cookies()

  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    maxAge: sessionDurationSeconds,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(sessionCookieName)
}
