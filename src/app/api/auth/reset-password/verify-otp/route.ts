import { prisma } from '@/lib/prisma'
import { authOtpTokenLimit, verifyResetPasswordOtp } from '@/server/auth-otp'
import { ApiError, fail, ok } from '@/server/http'
import { z } from 'zod'

const verifyResetPasswordOtpSchema = z.object({
  otp: z.string().trim().length(6),
  tokens: z.array(z.string().trim().min(1)).min(1).max(authOtpTokenLimit),
})

export async function POST(request: Request) {
  try {
    const body = verifyResetPasswordOtpSchema.parse(await request.json())
    const payload = await verifyResetPasswordOtp(body.tokens, body.otp)
    const credentialAccount = await prisma.account.findFirst({
      where: {
        providerId: 'credential',
        userId: payload.userId,
      },
      select: {
        updatedAt: true,
      },
    })

    if (!credentialAccount) {
      throw new ApiError(
        404,
        'Password sign-in is not available for this user.'
      )
    }

    if (
      credentialAccount.updatedAt.getTime() >
      new Date(payload.accountUpdatedAt).getTime()
    ) {
      throw new ApiError(409, 'This code has expired. Request a new one.')
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
