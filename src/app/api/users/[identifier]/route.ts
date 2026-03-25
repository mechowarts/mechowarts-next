import { prisma } from '@/lib/prisma'
import { ApiError, fail, ok } from '@/server/http'
import { requireSession } from '@/server/session'
import { getUserById, getUserByRollNumber } from '@/server/users'
import { z } from 'zod'

const institutionSchema = z.object({
  name: z.string(),
  location: z.string().optional(),
})

const updateUserSchema = z.object({
  name: z.string().min(1),
  avatarUrl: z.string(),
  bio: z.string(),
  bloodGroup: z.string().optional(),
  homeTown: z.string().optional(),
  phone: z.string().optional(),
  facebookUrl: z.string().optional(),
  isPublic: z.boolean(),
  colleges: z.array(institutionSchema),
  schools: z.array(institutionSchema),
})

interface RouteContext {
  params: Promise<{ identifier: string }>
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const params = await context.params
    const rollNumber = Number.parseInt(params.identifier, 10)

    if (!Number.isInteger(rollNumber) || rollNumber <= 0) {
      throw new ApiError(400, 'Invalid roll number.')
    }

    const user = await getUserByRollNumber(rollNumber)

    return ok(user)
  } catch (error) {
    return fail(error)
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await requireSession()
    const params = await context.params

    if (session.user.id !== params.identifier) {
      throw new ApiError(403, 'You cannot update this profile.')
    }

    const body = updateUserSchema.parse(await request.json())

    await prisma.user.update({
      where: { id: params.identifier },
      data: {
        name: body.name,
        avatarUrl: body.avatarUrl,
        bio: body.bio,
        bloodGroup: body.bloodGroup,
        homeTown: body.homeTown,
        phone: body.phone,
        facebookUrl: body.facebookUrl,
        isPublic: body.isPublic,
      },
    })

    await prisma.userInstitution.deleteMany({
      where: { userId: params.identifier },
    })

    const institutions = [
      ...body.colleges
        .filter((institution) => institution.name.trim() !== '')
        .map((institution, index) => ({
          userId: params.identifier,
          kind: 'college' as const,
          name: institution.name,
          location: institution.location,
          sortOrder: index,
        })),
      ...body.schools
        .filter((institution) => institution.name.trim() !== '')
        .map((institution, index) => ({
          userId: params.identifier,
          kind: 'school' as const,
          name: institution.name,
          location: institution.location,
          sortOrder: index,
        })),
    ]

    if (institutions.length > 0) {
      await prisma.userInstitution.createMany({ data: institutions })
    }

    const user = await getUserById(params.identifier)

    if (!user) {
      throw new ApiError(404, 'User not found.')
    }

    return ok(user)
  } catch (error) {
    return fail(error)
  }
}
