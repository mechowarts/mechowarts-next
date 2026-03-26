'use server'
import 'server-only'

import { serverEnv } from '@/env.server'
import { prisma } from '@/server/lib/prisma'
import { SignJWT, jwtVerify } from 'jose'
import ms from 'ms'
import { cookies } from 'next/headers'

const sessionCookieName = 'mechowarts_session'
const sessionDurationSeconds = ms('30d') / 1000
const jwtSecret = new TextEncoder().encode(serverEnv.JWT_SECRET)

type SessionTokenInput = {
  pca: number | null
  sub: string
}

type SessionTokenOutput = SessionTokenInput & {
  iat: number
}

export async function getSessionToken(): Promise<SessionTokenOutput | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(sessionCookieName)?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, jwtSecret)
    return payload as SessionTokenOutput
  } catch {
    return null
  }
}

export async function setSessionCookie(payload: SessionTokenInput) {
  const token = await new SignJWT({ pca: payload.pca })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${sessionDurationSeconds}s`)
    .setSubject(payload.sub)
    .sign(jwtSecret)

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

export async function getAuthUser() {
  const token = await getSessionToken()
  if (!token) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: token.sub },
    omit: { password: true },
  })
  if (!user) {
    return null
  }

  if (
    user.passwordChangedAt != null &&
    user.passwordChangedAt.getTime() > token.iat * 1000
  ) {
    return null
  }

  return user
}

export async function requireAuthUser() {
  const session = await getAuthUser()

  if (!session) {
    throw new Error('Unauthorized.')
  }

  return session
}

export type AuthUser = NonNullable<Awaited<ReturnType<typeof getAuthUser>>>
