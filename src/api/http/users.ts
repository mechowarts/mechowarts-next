import { apiRequest } from '@/api/http/client'
import type { ProfileData, User } from '@/types'

export async function getAllUsers() {
  return apiRequest<User[]>('/api/users')
}

export async function getUserByRoll(roll: string) {
  return apiRequest<null | User>(`/api/users/${roll}`)
}

export async function updateUserProfile(user: User) {
  return apiRequest<null | User>(`/api/users/${user.id}`, {
    method: 'PATCH',
    json: {
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      bloodGroup: user.bloodGroup,
      colleges: user.colleges ?? [],
      facebookUrl: user.facebookUrl,
      homeTown: user.homeTown,
      isPublic: user.isPublic ?? true,
      name: user.name,
      phone: user.phone,
      schools: user.schools ?? [],
    },
  })
}

export async function uploadAvatarFile(file: File) {
  const formData = new FormData()

  formData.set('file', file)

  return apiRequest<{ url: string }>('/api/uploads/avatar', {
    body: formData,
    method: 'POST',
  })
}

export async function completeUserProfile(data: {
  avatarUrl: string
  bio: string
  bloodGroup: string
  colleges: ProfileData['colleges']
  homeTown: string
  id: string
  name: string
  rollNumber: number
  schools: ProfileData['schools']
}) {
  return apiRequest<null | User>(`/api/users/${data.id}`, {
    method: 'PATCH',
    json: {
      avatarUrl: data.avatarUrl,
      bio: data.bio,
      bloodGroup: data.bloodGroup,
      colleges: data.colleges,
      facebookUrl: undefined,
      homeTown: data.homeTown,
      isPublic: true,
      name: data.name,
      phone: undefined,
      schools: data.schools,
    },
  })
}
