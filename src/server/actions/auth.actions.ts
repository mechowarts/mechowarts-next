'use server'
import 'server-only'

import {
  authOtpTokenLimit,
  createRegisterOtp,
  createResetPasswordOtp,
  verifyRegisterOtp,
  verifyResetPasswordOtp,
} from '@/server/helpers/auth-otp'
import {
  clearSessionCookie,
  getAuthUser,
  setSessionCookie,
} from '@/server/helpers/session'
import { sendOtpEmail } from '@/server/lib/mailer'
import { hashPassword, verifyPassword } from '@/server/lib/password'
import { prisma } from '@/server/lib/prisma'
import { buildStudentEmail } from '@/utils/roll'
import { z } from 'zod'

const requestOtpSchema = z.object({
  rollNumber: z.number().int().positive(),
})

const verifyOtpSchema = z.object({
  otp: z.string().length(6),
  tokens: z.array(z.string().min(1)).min(1).max(authOtpTokenLimit),
})

const registerSchema = z.object({
  gender: z.enum(['male', 'female']),
  location: z.string().min(1),
  name: z.string().min(1),
  otp: z.string().length(6),
  password: z.string().min(8),
  rollNumber: z.number().int().positive(),
  tokens: z.array(z.string().min(1)).min(1).max(authOtpTokenLimit),
  visibility: z.enum(['public', 'private']),
})

const resetPasswordSchema = z.object({
  otp: z.string().length(6),
  password: z.string().min(8),
  tokens: z.array(z.string().min(1)).min(1).max(authOtpTokenLimit),
})

const signInSchema = z.object({
  password: z.string().min(1),
  rollNumber: z.number().int().positive(),
})

export async function getSessionAction() {
  return getAuthUser()
}

export async function signOutAction() {
  await clearSessionCookie()
  return { success: true }
}

export async function signInAction(input: z.infer<typeof signInSchema>) {
  const body = signInSchema.parse(input)
  const user = await prisma.user.findUnique({
    where: { roll: body.rollNumber },
    select: {
      id: true,
      password: true,
      passwordChangedAt: true,
    },
  })

  if (!user) {
    throw new Error('No account found for this roll number.')
  }

  const isPasswordValid = await verifyPassword({
    hash: user.password,
    password: body.password,
  })

  if (!isPasswordValid) {
    throw new Error('Incorrect password.')
  }

  await setSessionCookie({
    pca: user.passwordChangedAt?.getTime() ?? null,
    sub: user.id,
  })

  return { success: true }
}

export async function requestRegisterOtp(
  input: z.infer<typeof requestOtpSchema>
) {
  const body = requestOtpSchema.parse(input)
  const email = buildStudentEmail(String(body.rollNumber))
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { roll: body.rollNumber }],
    },
    select: { id: true },
  })

  if (existingUser) {
    throw new Error('An account already exists for this roll number.')
  }

  const otp = await createRegisterOtp(body.rollNumber)

  await sendOtpEmail({
    description: `Use this code to verify your registration for roll ${body.rollNumber}.`,
    email: otp.email,
    otp: otp.otp,
    subject: 'Verify your MechoWarts registration',
  })

  return { email: otp.email, token: otp.token }
}

export async function verifyRegisterOtpAction(
  input: z.infer<typeof verifyOtpSchema>
) {
  const body = verifyOtpSchema.parse(input)
  const payload = await verifyRegisterOtp(body.tokens, body.otp)
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: payload.email }, { roll: payload.rollNumber }],
    },
    select: { id: true },
  })

  if (existingUser) {
    throw new Error('This roll number is already registered.')
  }

  return {
    email: payload.email,
    rollNumber: payload.rollNumber,
    success: true,
  }
}

export async function registerWithOtp(input: z.infer<typeof registerSchema>) {
  const body = registerSchema.parse(input)
  const payload = await verifyRegisterOtp(body.tokens, body.otp)

  if (payload.rollNumber !== body.rollNumber) {
    throw new Error('The verification code does not match this roll.')
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: payload.email }, { roll: payload.rollNumber }],
    },
    select: { id: true },
  })

  if (existingUser) {
    throw new Error('This roll number is already registered.')
  }

  const user = await prisma.user.create({
    data: {
      email: payload.email,
      gender: body.gender,
      location: body.location,
      name: body.name,
      password: await hashPassword(body.password),
      roll: payload.rollNumber,
      visibility: body.visibility,
    },
  })

  await setSessionCookie({
    pca: null,
    sub: user.id,
  })

  return { success: true }
}

export async function requestResetPasswordOtp(
  input: z.infer<typeof requestOtpSchema>
) {
  const body = requestOtpSchema.parse(input)
  const user = await prisma.user.findUnique({
    where: { roll: body.rollNumber },
    select: {
      id: true,
      email: true,
      passwordChangedAt: true,
    },
  })

  if (!user) {
    throw new Error('No account found for this roll number.')
  }

  const otp = await createResetPasswordOtp({
    passwordChangedAt: user.passwordChangedAt?.toISOString() ?? null,
    rollNumber: body.rollNumber,
    userId: user.id,
  })

  await sendOtpEmail({
    description: `Use this code to reset the password for roll ${body.rollNumber}.`,
    email: user.email,
    otp: otp.otp,
    subject: 'Reset your MechoWarts password',
  })

  return { email: user.email, token: otp.token }
}

export async function verifyResetPasswordOtpAction(
  input: z.infer<typeof verifyOtpSchema>
) {
  const body = verifyOtpSchema.parse(input)
  const payload = await verifyResetPasswordOtp(body.tokens, body.otp)
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      passwordChangedAt: true,
    },
  })

  if (!user) {
    throw new Error('User not found.')
  }

  const isExpired =
    payload.passwordChangedAt === null
      ? user.passwordChangedAt !== null
      : user.passwordChangedAt?.getTime() !==
        new Date(payload.passwordChangedAt).getTime()

  if (isExpired) {
    throw new Error('This code has expired. Request a new one.')
  }

  return {
    email: payload.email,
    rollNumber: payload.rollNumber,
    success: true,
  }
}

export async function resetPassword(
  input: z.infer<typeof resetPasswordSchema>
) {
  const body = resetPasswordSchema.parse(input)
  const payload = await verifyResetPasswordOtp(body.tokens, body.otp)
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      passwordChangedAt: true,
    },
  })

  if (!user) {
    throw new Error('User not found.')
  }

  const isExpired =
    payload.passwordChangedAt === null
      ? user.passwordChangedAt !== null
      : user.passwordChangedAt?.getTime() !==
        new Date(payload.passwordChangedAt).getTime()

  if (isExpired) {
    throw new Error('This code has already been used. Request a new one.')
  }

  const passwordChangedAt = new Date()

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(body.password),
      passwordChangedAt,
    },
  })

  await setSessionCookie({
    pca: passwordChangedAt.getTime(),
    sub: user.id,
  })

  return { rollNumber: payload.rollNumber, success: true }
}
