import { sendOtpEmail } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'
import { createRegisterOtp } from '@/server/auth-otp'
import { ApiError, fail, ok } from '@/server/http'
import { buildStudentEmail } from '@/utils/roll'
import { z } from 'zod'

const requestRegisterOtpSchema = z.object({
  rollNumber: z.number().int().positive(),
})

export async function POST(request: Request) {
  try {
    const body = requestRegisterOtpSchema.parse(await request.json())
    const email = buildStudentEmail(String(body.rollNumber))
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { rollNumber: body.rollNumber }],
      },
      select: { id: true },
    })

    if (existingUser) {
      throw new ApiError(409, 'An account already exists for this roll number.')
    }

    const otp = await createRegisterOtp(body.rollNumber)

    await sendOtpEmail({
      description: `Use this code to verify your registration for roll ${body.rollNumber}.`,
      email: otp.email,
      otp: otp.otp,
      subject: 'Verify your MechoWarts registration',
    })

    return ok({ email: otp.email, token: otp.token })
  } catch (error) {
    return fail(error)
  }
}
