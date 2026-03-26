import { serverEnv } from '@/env.server'
import { ApiError } from '@/server/http'
import type { RegisterOtpPayload, ResetPasswordOtpPayload } from '@/types'
import { buildStudentEmail } from '@/utils/roll'
import OneTimeJwt from 'one-time-jwt'

export const authOtpTokenLimit = 5

const registerOtpJwt = new OneTimeJwt(
  `${serverEnv.BETTER_AUTH_SECRET}:register-otp`,
  {
    logLevel: 'silent',
    maxTokenLimitPerPurpose: authOtpTokenLimit,
  }
)

const resetPasswordOtpJwt = new OneTimeJwt(
  `${serverEnv.BETTER_AUTH_SECRET}:reset-password-otp`,
  {
    logLevel: 'silent',
    maxTokenLimitPerPurpose: authOtpTokenLimit,
  }
)

function getOtpErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export async function createRegisterOtp(rollNumber: number) {
  const email = buildStudentEmail(String(rollNumber))
  const result = await registerOtpJwt.createToken(
    'register',
    {
      email,
      requestedAt: new Date().toISOString(),
      rollNumber,
    } satisfies RegisterOtpPayload,
    {
      expiresIn: '10m',
      otpLength: 6,
      otpType: 'digits',
    }
  )

  return {
    email,
    otp: result.otp,
    token: result.token,
  }
}

export async function verifyRegisterOtp(tokens: string[], otp: string) {
  try {
    return await registerOtpJwt.verifyToken<RegisterOtpPayload>(
      'register',
      tokens,
      {
        maxTokenLimitPerPurpose: authOtpTokenLimit,
        otp,
      }
    )
  } catch (error) {
    throw new ApiError(
      400,
      getOtpErrorMessage(error, 'Invalid registration code.')
    )
  }
}

export async function createResetPasswordOtp(data: {
  accountUpdatedAt: string
  rollNumber: number
  userId: string
}) {
  const email = buildStudentEmail(String(data.rollNumber))
  const result = await resetPasswordOtpJwt.createToken(
    'reset-password',
    {
      accountUpdatedAt: data.accountUpdatedAt,
      email,
      requestedAt: new Date().toISOString(),
      rollNumber: data.rollNumber,
      userId: data.userId,
    } satisfies ResetPasswordOtpPayload,
    {
      expiresIn: '10m',
      otpLength: 6,
      otpType: 'digits',
    }
  )

  return {
    email,
    otp: result.otp,
    token: result.token,
  }
}

export async function verifyResetPasswordOtp(tokens: string[], otp: string) {
  try {
    return await resetPasswordOtpJwt.verifyToken<ResetPasswordOtpPayload>(
      'reset-password',
      tokens,
      {
        maxTokenLimitPerPurpose: authOtpTokenLimit,
        otp,
      }
    )
  } catch (error) {
    throw new ApiError(
      400,
      getOtpErrorMessage(error, 'Invalid password reset code.')
    )
  }
}
