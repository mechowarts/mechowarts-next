'use server'

import 'server-only'

import { prisma } from '@/lib/prisma'
import { requireSession } from '../session'
import { uploadAvatar } from '../storage'

export async function changeUserAvatar(input: File) {
  const session = await requireSession()

  const result = await uploadAvatar(input, session.user.id)

  return await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: result },
  })
}

export async function removeUserAvatar() {
  const session = await requireSession()

  return prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: null },
  })
}
