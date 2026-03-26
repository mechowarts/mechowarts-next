import { hashPassword } from '@/lib/password'
import { prisma } from '@/lib/prisma'
import { authOtpTokenLimit, verifyResetPasswordOtp } from '@/server/auth-otp'
import { ApiError, fail, ok } from '@/server/http'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  otp: z.string().trim().length(6),
  password: z.string().min(8),
  tokens: z.array(z.string().trim().min(1)).min(1).max(authOtpTokenLimit),
})

export async function POST(request: Request) {
  try {
    const body = resetPasswordSchema.parse(await request.json())
    const payload = await verifyResetPasswordOtp(body.tokens, body.otp)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true },
    })

    if (!user) {
      throw new ApiError(404, 'User not found.')
    }

    const credentialAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: 'credential',
      },
      select: { id: true, updatedAt: true },
    })

    if (!credentialAccount) {
      throw new ApiError(404, 'Credential account not found.')
    }

    if (
      credentialAccount.updatedAt.getTime() >
      new Date(payload.accountUpdatedAt).getTime()
    ) {
      throw new ApiError(
        409,
        'This code has already been used. Request a new one.'
      )
    }

    await prisma.account.update({
      where: { id: credentialAccount.id },
      data: {
        password: await hashPassword(body.password),
      },
    })

    await prisma.session.deleteMany({ where: { userId: user.id } })

    return ok({ rollNumber: payload.rollNumber, success: true })
  } catch (error) {
    return fail(error)
  }
}
