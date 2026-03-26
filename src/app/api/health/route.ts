import { prisma } from '@/server/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    let isDatabaseHealthy = true

    try {
      await prisma.user.count()
    } catch {
      isDatabaseHealthy = false
    }

    return NextResponse.json({
      status: isDatabaseHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: isDatabaseHealthy,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Health check failed.',
      },
      { status: 500 }
    )
  }
}
