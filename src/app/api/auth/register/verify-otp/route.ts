import { prisma } from '@/lib/prisma'
import { authOtpTokenLimit, verifyRegisterOtp } from '@/server/auth-otp'
import { ApiError, fail, ok } from '@/server/http'
import { z } from 'zod'

const verifyRegisterOtpSchema = z.object({
  otp: z.string().trim().length(6),
  tokens: z.array(z.string().trim().min(1)).min(1).max(authOtpTokenLimit),
})

export async function POST(request: Request) {
  try {
    const body = verifyRegisterOtpSchema.parse(await request.json())
    const payload = await verifyRegisterOtp(body.tokens, body.otp)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: payload.email }, { rollNumber: payload.rollNumber }],
      },
      select: { id: true },
    })

    if (existingUser) {
      throw new ApiError(409, 'This roll number is already registered.')
    }

    return ok({
      email: payload.email,
      rollNumber: payload.rollNumber,
      success: true,
    })
  } catch (error) {
    return fail(error)
  }
}
