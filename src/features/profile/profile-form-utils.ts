import { useAuth } from '@/hooks/use-auth'
import type { Institution, User } from '@/types'

export function ensureInstitutions(value: Institution[] | undefined) {
  return Array.isArray(value) ? value : []
}

export function readInstitutions(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || !('name' in item)) {
      return []
    }

    if (typeof item.name !== 'string') {
      return []
    }

    return [
      {
        name: item.name,
        location:
          'location' in item && typeof item.location === 'string'
            ? item.location
            : undefined,
      },
    ]
  })
}

export function revokeObjectUrl(value: null | string) {
  if (!value?.startsWith('blob:')) {
    return
  }

  URL.revokeObjectURL(value)
}

export function createProfileState(
  user: NonNullable<ReturnType<typeof useAuth>['user']>
) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio ?? '',
    isPublic: user.isPublic ?? true,
    bloodGroup: user.bloodGroup ?? '',
    homeTown: user.homeTown ?? '',
    colleges: ensureInstitutions(
      'colleges' in user ? readInstitutions(user.colleges) : undefined
    ),
    schools: ensureInstitutions(
      'schools' in user ? readInstitutions(user.schools) : undefined
    ),
    avatarUrl: user.avatarUrl ?? '',
    phone: user.phone ?? '',
    facebookUrl: user.facebookUrl ?? '',
    rollNumber: user.rollNumber ?? undefined,
  } satisfies User
}
