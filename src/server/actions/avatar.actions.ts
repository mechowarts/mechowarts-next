'use server'
import 'server-only'

import { prisma } from '@/server/lib/prisma'
import { requireAuthUser } from '../helpers/session'
import { uploadAvatar } from '../helpers/storage'

export async function changeUserAvatar(input: File) {
  const session = await requireAuthUser()

  if (!input.type.startsWith('image/')) {
    throw new Error('Please upload an image file.')
  }

  if (input.size > 5 * 1024 * 1024) {
    throw new Error('Avatar image must be 5 MB or smaller.')
  }

  const result = await uploadAvatar(input, session.id)

  await prisma.user.update({
    where: { id: session.id },
    data: { avatar: result },
  })

  return { avatar: result }
}

export async function removeUserAvatar() {
  const session = await requireAuthUser()

  await prisma.user.update({
    where: { id: session.id },
    data: { avatar: null },
  })

  return { avatar: '' }
}
