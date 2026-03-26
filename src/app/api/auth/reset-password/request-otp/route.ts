import { sendOtpEmail } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'
import { createResetPasswordOtp } from '@/server/auth-otp'
import { ApiError, fail, ok } from '@/server/http'
import { z } from 'zod'

const requestResetPasswordOtpSchema = z.object({
  rollNumber: z.number().int().positive(),
})

export async function POST(request: Request) {
  try {
    const body = requestResetPasswordOtpSchema.parse(await request.json())
    const user = await prisma.user.findUnique({
      where: { rollNumber: body.rollNumber },
      select: {
        id: true,
        email: true,
      },
    })

    if (!user) {
      throw new ApiError(404, 'No account found for this roll number.')
    }

    const credentialAccount = await prisma.account.findFirst({
      where: {
        providerId: 'credential',
        userId: user.id,
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

    const otp = await createResetPasswordOtp({
      accountUpdatedAt: credentialAccount.updatedAt.toISOString(),
      rollNumber: body.rollNumber,
      userId: user.id,
    })

    await sendOtpEmail({
      description: `Use this code to reset the password for roll ${body.rollNumber}.`,
      email: user.email,
      otp: otp.otp,
      subject: 'Reset your MechoWarts password',
    })

    return ok({ email: user.email, token: otp.token })
  } catch (error) {
    return fail(error)
  }
}
