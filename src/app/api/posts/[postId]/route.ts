import { prisma } from '@/lib/prisma'
import { ApiError, fail, ok } from '@/server/http'
import { requireSession } from '@/server/session'
import { z } from 'zod'

const updatePostSchema = z.object({
  caption: z.string().min(1),
  location: z.string().optional(),
  imageUrl: z.string().optional(),
})

interface RouteContext {
  params: Promise<{ postId: string }>
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const params = await context.params
    const post = await prisma.post.findUnique({
      where: { id: params.postId },
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

    if (!post) {
      return ok(null)
    }

    return ok({
      id: post.id,
      caption: post.caption,
      location: post.location ?? undefined,
      imageUrl: post.imageUrl ?? undefined,
      creatorId: post.authorId,
      authorName: post.author.name,
    })
  } catch (error) {
    return fail(error)
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await requireSession()
    const params = await context.params
    const body = updatePostSchema.parse(await request.json())
    const post = await prisma.post.findUnique({
      where: { id: params.postId },
      select: {
        authorId: true,
      },
    })

    if (!post) {
      throw new ApiError(404, 'Post not found.')
    }

    if (post.authorId !== session.user.id) {
      throw new ApiError(403, 'You cannot edit this post.')
    }

    const updatedPost = await prisma.post.update({
      where: { id: params.postId },
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

    return ok({
      id: updatedPost.id,
      caption: updatedPost.caption,
      location: updatedPost.location ?? undefined,
      imageUrl: updatedPost.imageUrl ?? undefined,
      creatorId: updatedPost.authorId,
      authorName: updatedPost.author.name,
    })
  } catch (error) {
    return fail(error)
  }
}
