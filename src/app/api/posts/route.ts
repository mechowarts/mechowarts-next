import { prisma } from '@/lib/prisma'
import { ApiError, fail, ok } from '@/server/http'
import { requireSession } from '@/server/session'
import { z } from 'zod'

const createPostSchema = z.object({
  caption: z.string().min(1),
  location: z.string().optional(),
  imageUrl: z.string().optional(),
})

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
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

    const mappedPosts: Array<{
      authorName: string
      caption: string
      creatorId: string
      id: string
      imageUrl?: string
      location?: string
    }> = []

    for (const post of posts) {
      mappedPosts.push({
        id: post.id,
        caption: post.caption,
        location: post.location ?? undefined,
        imageUrl: post.imageUrl ?? undefined,
        creatorId: post.authorId,
        authorName: post.author.name,
      })
    }

    return ok(mappedPosts)
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    const body = createPostSchema.parse(await request.json())
    const post = await prisma.post.create({
      data: {
        authorId: session.user.id,
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

    return ok(
      {
        id: post.id,
        caption: post.caption,
        location: post.location ?? undefined,
        imageUrl: post.imageUrl ?? undefined,
        creatorId: post.authorId,
        authorName: post.author.name,
      },
      201
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail(
        new ApiError(400, error.issues[0]?.message ?? 'Invalid input.')
      )
    }

    return fail(error)
  }
}
