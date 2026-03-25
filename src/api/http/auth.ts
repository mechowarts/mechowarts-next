import { apiRequest } from '@/api/http/client'
import { authClient } from '@/lib/auth-client'
import type {
  NewUserPayload,
  ResetPasswordPayload,
  SignInPayload,
} from '@/types'
import { buildStudentEmail } from '@/utils/roll'

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  return fallback
}

export async function signInAccount(payload: SignInPayload) {
  const response = await authClient.signIn.email({
    email: buildStudentEmail(String(payload.rollNumber)),
    password: payload.password,
  })

  if (response.error) {
    throw new Error(getErrorMessage(response.error, 'Login failed.'))
  }

  return response
}

export async function signOutAccount() {
  const response = await authClient.signOut()

  if (response.error) {
    throw new Error(getErrorMessage(response.error, 'Logout failed.'))
  }

  return { success: true }
}

export async function createUserAccount(payload: NewUserPayload) {
  const response = await authClient.signUp.email({
    email: buildStudentEmail(String(payload.rollNumber)),
    password: payload.password,
    name: payload.name,
  })

  if (response.error) {
    throw new Error(getErrorMessage(response.error, 'Registration failed.'))
  }

  return response
}

export async function resetPassword(payload: ResetPasswordPayload) {
  return apiRequest<{ success: boolean }>('/api/auth/reset-password', {
    method: 'POST',
    json: payload,
  })
}
