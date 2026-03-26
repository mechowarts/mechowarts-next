'use server'

import 'server-only'

import { requireAuthUser } from '@/server/helpers/session'
import { prisma } from '@/server/lib/prisma'
import { z } from 'zod'

const institutionSchema = z.object({
  kind: z.enum(['college', 'school']),
  name: z.string(),
  location: z.string().optional(),
})

const updateUserSchema = z.object({
  name: z.string().min(1),
  avatar: z.string(),
  bio: z.string(),
  bloodGroup: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  facebookId: z.string().optional(),
  visibility: z.enum(['public', 'private']),
  institutions: z.array(institutionSchema),
})

export async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      roll: true,
      avatar: true,
      bio: true,
      bloodGroup: true,
      location: true,
      phone: true,
      facebookId: true,
      visibility: true,
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

  return users.map((user) => ({
    ...user,
  }))
}

export async function getUserByRoll(roll: string) {
  const parsedRoll = Number.parseInt(roll, 10)

  if (!Number.isInteger(parsedRoll) || parsedRoll <= 0) {
    throw new Error('Invalid roll number.')
  }

  const user = await prisma.user.findUnique({
    where: { roll: parsedRoll },
    select: {
      id: true,
      name: true,
      email: true,
      roll: true,
      avatar: true,
      bio: true,
      bloodGroup: true,
      location: true,
      phone: true,
      facebookId: true,
      visibility: true,
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
    return null
  }

  return {
    ...user,
  }
}

export async function updateUserProfile(
  userId: string,
  input: z.infer<typeof updateUserSchema>
) {
  const session = await requireAuthUser()

  if (session.id !== userId) {
    throw new Error('You cannot update this profile.')
  }

  const body = updateUserSchema.parse(input)

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: body.name,
      avatar: body.avatar,
      bio: body.bio,
      bloodGroup: body.bloodGroup,
      location: body.location,
      phone: body.phone,
      facebookId: body.facebookId,
      visibility: body.visibility,
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
      roll: true,
      avatar: true,
      bio: true,
      bloodGroup: true,
      location: true,
      phone: true,
      facebookId: true,
      visibility: true,
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

  return {
    ...user,
  }
}
