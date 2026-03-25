import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function fail(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    )
  }

  return NextResponse.json(
    { message: 'Internal server error.' },
    { status: 500 }
  )
}
