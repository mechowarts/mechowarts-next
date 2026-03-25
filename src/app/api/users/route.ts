import { fail, ok } from '@/server/http'
import { listUsers } from '@/server/users'

export async function GET() {
  try {
    const users = await listUsers()
    return ok(users)
  } catch (error) {
    return fail(error)
  }
}
