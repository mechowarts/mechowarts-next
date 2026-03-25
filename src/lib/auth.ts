import { rollNumberPattern, studentEmailDomain } from '@/constants/auth'
import { serverEnv } from '@/env.server'
import { hashPassword, verifyPassword } from '@/lib/password'
import { prisma } from '@/lib/prisma'
import { prismaAdapter } from '@better-auth/prisma-adapter'
import { betterAuth } from 'better-auth'

function getRollNumberFromEmail(email: string) {
  if (!email.endsWith(studentEmailDomain)) {
    return null
  }

  const roll = email.slice(0, -studentEmailDomain.length)

  if (!rollNumberPattern.test(roll)) {
    return null
  }

  return Number.parseInt(roll, 10)
}

export const auth = betterAuth({
  secret: serverEnv.BETTER_AUTH_SECRET,
  trustedOrigins: [serverEnv.APP_URL],

  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
  },

  user: {
    additionalFields: {
      rollNumber: {
        type: 'number',
        required: false,
      },
      avatarUrl: {
        type: 'string',
        required: false,
        defaultValue: '',
      },
      bio: {
        type: 'string',
        required: false,
        defaultValue: '',
      },
      bloodGroup: {
        type: 'string',
        required: false,
      },
      homeTown: {
        type: 'string',
        required: false,
      },
      phone: {
        type: 'string',
        required: false,
      },
      facebookUrl: {
        type: 'string',
        required: false,
      },
      isPublic: {
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const rollNumber = getRollNumberFromEmail(user.email)

          if (rollNumber === null) {
            return { data: user }
          }

          return {
            data: {
              ...user,
              rollNumber,
            },
          }
        },
      },
    },
  },
})
