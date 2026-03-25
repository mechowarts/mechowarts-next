import { hashPassword } from '@/lib/password'
import { prisma } from '@/lib/prisma'
import { ApiError, fail, ok } from '@/server/http'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  rollNumber: z.number().int().positive(),
  password: z.string().min(8),
})

export async function POST(request: Request) {
  try {
    const body = resetPasswordSchema.parse(await request.json())
    const user = await prisma.user.findUnique({
      where: { rollNumber: body.rollNumber },
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
      select: { id: true },
    })

    if (!credentialAccount) {
      throw new ApiError(404, 'Credential account not found.')
    }

    await prisma.account.update({
      where: { id: credentialAccount.id },
      data: {
        password: await hashPassword(body.password),
      },
    })

    await prisma.session.deleteMany({ where: { userId: user.id } })

    return ok({ success: true })
  } catch (error) {
    return fail(error)
  }
}
