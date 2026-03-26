import { prisma } from '@/server/lib/prisma'
import { readSessionToken } from '@/server/lib/session-auth'

export async function getSession() {
  const token = await readSessionToken()

  if (!token) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: token.userId },
    select: {
      id: true,
      email: true,
      name: true,
      roll: true,
      avatar: true,
      bio: true,
      bloodGroup: true,
      location: true,
      phone: true,
      facebookId: true,
      visibility: true,
      passwordChangedAt: true,
      institutions: {
        select: {
          id: true,
          kind: true,
          name: true,
          location: true,
        },
      },
    },
  })

  if (!user) {
    return null
  }

  if (user.passwordChangedAt) {
    const issuedAtMilliseconds = token.issuedAt * 1000

    if (user.passwordChangedAt.getTime() > issuedAtMilliseconds) {
      return null
    }
  }

  const { passwordChangedAt: _, ...sessionUser } = user

  return {
    user: {
      ...sessionUser,
      rollNumber: sessionUser.roll,
    },
  }
}

export async function requireSession() {
  const session = await getSession()

  if (!session) {
    throw new Error('Unauthorized.')
  }

  return session
}
