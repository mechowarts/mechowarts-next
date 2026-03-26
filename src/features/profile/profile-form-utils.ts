import { useAuth } from '@/hooks/use-auth'

function readInstitutions(
  institutions:
    | Array<{
        kind: 'college' | 'school'
        location: null | string
        name: string
      }>
    | undefined,
  kind: 'college' | 'school'
) {
  return (institutions ?? [])
    .filter((institution) => institution.kind === kind)
    .map((institution) => ({
      name: institution.name,
      location: institution.location ?? '',
    }))
}

function getUserInstitutions(
  user: NonNullable<ReturnType<typeof useAuth>['user']>
) {
  if (!('institutions' in user) || !Array.isArray(user.institutions)) {
    return undefined
  }

  return user.institutions as Array<{
    kind: 'college' | 'school'
    location: null | string
    name: string
  }>
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
    visibility: user.visibility ?? 'public',
    bloodGroup: user.bloodGroup ?? '',
    location: user.location ?? '',
    colleges: readInstitutions(getUserInstitutions(user), 'college'),
    schools: readInstitutions(getUserInstitutions(user), 'school'),
    avatar: user.avatar ?? '',
    phone: user.phone ?? '',
    facebookId: user.facebookId ?? '',
    rollNumber: user.rollNumber ?? undefined,
  }
}
