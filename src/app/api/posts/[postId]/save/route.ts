import { prisma } from '@/lib/prisma'
import { ApiError, fail, ok } from '@/server/http'
import { requireSession } from '@/server/session'

interface RouteContext {
  params: Promise<{ postId: string }>
}

export async function POST(_: Request, context: RouteContext) {
  try {
    const session = await requireSession()
    const params = await context.params
    const post = await prisma.post.findUnique({
      where: { id: params.postId },
      select: { id: true },
    })

    if (!post) {
      throw new ApiError(404, 'Post not found.')
    }

    await prisma.postSave.upsert({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: params.postId,
        },
      },
      create: {
        userId: session.user.id,
        postId: params.postId,
      },
      update: {},
    })

    return ok({ success: true })
  } catch (error) {
    return fail(error)
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const session = await requireSession()
    const params = await context.params

    await prisma.postSave.deleteMany({
      where: {
        userId: session.user.id,
        postId: params.postId,
      },
    })

    return ok({ success: true })
  } catch (error) {
    return fail(error)
  }
}
