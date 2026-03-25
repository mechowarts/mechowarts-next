import { prisma } from '@/lib/prisma'
import { fail, ok } from '@/server/http'

export async function GET() {
  try {
    let isDatabaseHealthy = true

    try {
      await prisma.user.count()
    } catch {
      isDatabaseHealthy = false
    }

    return ok({
      status: isDatabaseHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: isDatabaseHealthy,
      },
    })
  } catch (error) {
    return fail(error)
  }
}
