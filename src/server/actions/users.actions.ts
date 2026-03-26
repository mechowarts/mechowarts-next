'use server'

import 'server-only'

import { prisma } from '@/server/lib/prisma'
import { requireSession } from '@/server/helpers/session'
import { z } from 'zod'

const institutionSchema = z.object({
  kind: z.enum(['college', 'school']),
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
  institutions: z.array(institutionSchema),
})

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      rollNumber: true,
      avatarUrl: true,
      bio: true,
      bloodGroup: true,
      homeTown: true,
      phone: true,
      facebookUrl: true,
      isPublic: true,
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
}

export async function getUserByRoll(roll: string) {
  const rollNumber = Number.parseInt(roll, 10)

  if (!Number.isInteger(rollNumber) || rollNumber <= 0) {
    throw new Error('Invalid roll number.')
  }

  return prisma.user.findUnique({
    where: { rollNumber },
    select: {
      id: true,
      name: true,
      email: true,
      rollNumber: true,
      avatarUrl: true,
      bio: true,
      bloodGroup: true,
      homeTown: true,
      phone: true,
      facebookUrl: true,
      isPublic: true,
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
}

export async function updateUserProfile(
  userId: string,
  input: z.infer<typeof updateUserSchema>
) {
  const session = await requireSession()

  if (session.user.id !== userId) {
    throw new Error('You cannot update this profile.')
  }

  const body = updateUserSchema.parse(input)

  await prisma.user.update({
    where: { id: userId },
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
    where: { userId },
  })

  if (body.institutions.length > 0) {
    await prisma.userInstitution.createMany({
      data: body.institutions.map((institution) => ({
        userId,
        kind: institution.kind,
        name: institution.name,
        location: institution.location,
      })),
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      rollNumber: true,
      avatarUrl: true,
      bio: true,
      bloodGroup: true,
      homeTown: true,
      phone: true,
      facebookUrl: true,
      isPublic: true,
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
    throw new Error('User not found.')
  }

  return user
}
