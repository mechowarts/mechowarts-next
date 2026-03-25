export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
  }
}

interface RequestOptions extends RequestInit {
  json?: unknown
}

async function parseResponse<T>(response: Response) {
  if (response.status === 204) {
    return null as T
  }

  const payload = (await response.json().catch(() => null)) as {
    data?: T
    message?: string
  } | null

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? 'Request failed. Please try again.',
      response.status
    )
  }

  return (payload?.data ?? null) as T
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
) {
  const { json, ...requestOptions } = options
  const headers = new Headers(requestOptions.headers)
  const requestBody =
    json === undefined ? requestOptions.body : JSON.stringify(json)

  if (json !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(path, {
    ...requestOptions,
    body: requestBody,
    credentials: 'include',
    headers,
  })

  return parseResponse<T>(response)
}
