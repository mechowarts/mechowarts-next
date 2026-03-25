import { prisma } from '@/lib/prisma'
import type { Institution, User } from '@/types'

function splitInstitutions(
  institutions: Array<{
    kind: 'college' | 'school'
    location: null | string
    name: string
  }>
) {
  return institutions.reduce(
    (acc, institution) => {
      const item: Institution = {
        name: institution.name,
        location: institution.location ?? undefined,
      }

      if (institution.kind === 'college') {
        acc.colleges.push(item)
      } else {
        acc.schools.push(item)
      }

      return acc
    },
    { colleges: [] as Institution[], schools: [] as Institution[] }
  )
}

function mapUser(
  user: {
    avatarUrl: string
    bio: string
    bloodGroup: null | string
    email: string
    facebookUrl: null | string
    homeTown: null | string
    id: string
    isPublic: boolean
    name: string
    phone: null | string
    rollNumber: null | number
  },
  institutions: { colleges: Institution[]; schools: Institution[] }
): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    rollNumber: user.rollNumber ?? undefined,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    bloodGroup: user.bloodGroup ?? undefined,
    homeTown: user.homeTown ?? undefined,
    colleges: institutions.colleges,
    schools: institutions.schools,
    isPublic: user.isPublic,
    phone: user.phone ?? undefined,
    facebookUrl: user.facebookUrl ?? undefined,
  }
}

export async function getUserById(userId: string) {
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
    },
  })

  if (!user) {
    return null
  }

  const institutions = await prisma.userInstitution.findMany({
    where: { userId },
    orderBy: { sortOrder: 'asc' },
    select: {
      kind: true,
      name: true,
      location: true,
    },
  })

  return mapUser(user, splitInstitutions(institutions))
}

export async function getUserByRollNumber(rollNumber: number) {
  const user = await prisma.user.findUnique({
    where: { rollNumber },
    select: { id: true },
  })

  if (!user) {
    return null
  }

  return getUserById(user.id)
}

export async function listUsers() {
  const users = await prisma.user.findMany({
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
    },
  })

  const userIds: string[] = []

  for (const user of users) {
    userIds.push(user.id)
  }

  const institutions = await prisma.userInstitution.findMany({
    where: { userId: { in: userIds } },
    orderBy: { sortOrder: 'asc' },
    select: {
      userId: true,
      kind: true,
      name: true,
      location: true,
    },
  })

  const grouped = new Map<
    string,
    Array<{ kind: 'college' | 'school'; location: null | string; name: string }>
  >()

  for (const institution of institutions) {
    const list = grouped.get(institution.userId) ?? []
    list.push(institution)
    grouped.set(institution.userId, list)
  }

  const result: User[] = []

  for (const user of users) {
    const items = grouped.get(user.id) ?? []
    result.push(mapUser(user, splitInstitutions(items)))
  }

  return result
}
