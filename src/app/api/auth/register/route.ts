import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { authOtpTokenLimit, verifyRegisterOtp } from '@/server/auth-otp'
import { ApiError, fail, ok } from '@/server/http'
import { z } from 'zod'

const registerSchema = z.object({
  bio: z.string().trim().optional(),
  bloodGroup: z.string().trim().min(1),
  facebookUrl: z.union([z.literal(''), z.url()]).optional(),
  homeTown: z.string().trim().min(1),
  name: z.string().trim().min(1),
  otp: z.string().trim().length(6),
  password: z.string().min(8),
  phone: z.string().trim().optional(),
  rollNumber: z.number().int().positive(),
  tokens: z.array(z.string().trim().min(1)).min(1).max(authOtpTokenLimit),
})

function normalizeOptionalString(value?: string) {
  const normalized = value?.trim()

  return normalized ? normalized : undefined
}

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json())
    const payload = await verifyRegisterOtp(body.tokens, body.otp)

    if (payload.rollNumber !== body.rollNumber) {
      throw new ApiError(400, 'The verification code does not match this roll.')
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: payload.email }, { rollNumber: payload.rollNumber }],
      },
      select: { id: true },
    })

    if (existingUser) {
      throw new ApiError(409, 'This roll number is already registered.')
    }

    await auth.api.signUpEmail({
      body: {
        avatarUrl: '',
        bio: normalizeOptionalString(body.bio) ?? '',
        bloodGroup: body.bloodGroup,
        email: payload.email,
        facebookUrl: normalizeOptionalString(body.facebookUrl),
        homeTown: body.homeTown,
        isPublic: true,
        name: body.name,
        password: body.password,
        phone: normalizeOptionalString(body.phone),
        rollNumber: payload.rollNumber,
      },
    })

    return ok({ success: true })
  } catch (error) {
    return fail(error)
  }
}
