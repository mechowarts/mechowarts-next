'use server'
import 'server-only'

import { requireAuthUser } from '@/server/helpers/session'
import { prisma } from '@/server/lib/prisma'
import { z } from 'zod'

const postInputSchema = z.object({
  caption: z.string().min(1),
  location: z.string().optional(),
  imageUrl: z.string().optional(),
})

export async function listPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      caption: true,
      location: true,
      imageUrl: true,
      authorId: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  })
}

export async function getPostById(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      caption: true,
      location: true,
      imageUrl: true,
      authorId: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  })

  return post
}

export async function createPost(input: {
  caption: string
  imageUrl?: string
  location?: string
}) {
  const session = await requireAuthUser()
  const body = postInputSchema.parse(input)
  return prisma.post.create({
    data: {
      authorId: session.id,
      caption: body.caption,
      location: body.location,
      imageUrl: body.imageUrl,
    },
    select: {
      id: true,
      caption: true,
      location: true,
      imageUrl: true,
      authorId: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  })
}

export async function updatePost(
  postId: string,
  input: { caption: string; imageUrl?: string; location?: string }
) {
  const session = await requireAuthUser()
  const body = postInputSchema.parse(input)
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      authorId: true,
    },
  })

  if (!post) {
    throw new Error('Post not found.')
  }

  if (post.authorId !== session.id) {
    throw new Error('You cannot edit this post.')
  }

  return prisma.post.update({
    where: { id: postId },
    data: {
      caption: body.caption,
      location: body.location,
      imageUrl: body.imageUrl,
    },
    select: {
      id: true,
      caption: true,
      location: true,
      imageUrl: true,
      authorId: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  })
}

export async function savePost(postId: string) {
  const session = await requireAuthUser()
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  })

  if (!post) {
    throw new Error('Post not found.')
  }

  await prisma.postSave.upsert({
    where: {
      userId_postId: {
        userId: session.id,
        postId,
      },
    },
    create: {
      userId: session.id,
      postId,
    },
    update: {},
  })

  return { success: true }
}

export async function unsavePost(postId: string) {
  const session = await requireAuthUser()

  await prisma.postSave.deleteMany({
    where: {
      userId: session.id,
      postId,
    },
  })

  return { success: true }
}
