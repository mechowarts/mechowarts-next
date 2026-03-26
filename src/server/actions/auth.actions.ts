'use server'
import 'server-only'

import {
  registerOTPGenerator,
  resetPasswordOTPGenerator,
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
  roll: z.number().int().positive(),
})

const registerSchema = z.object({
  gender: z.enum(['male', 'female']),
  location: z.string().min(1),
  name: z.string().min(1),
  otp: z.string().length(6),
  password: z.string().min(8),
  roll: z.number().int().positive(),
  tokens: z.array(z.string().min(1)).min(1),
  visibility: z.enum(['public', 'private']),
})

const resetPasswordSchema = z.object({
  otp: z.string().length(6),
  password: z.string().min(8),
  tokens: z.array(z.string().min(1)).min(1),
})

const signInSchema = z.object({
  password: z.string().min(1),
  roll: z.number().int().positive(),
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
    where: { roll: body.roll },
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

export async function requestRegisterOTPAction(
  input: z.infer<typeof requestOtpSchema>
) {
  const body = requestOtpSchema.parse(input)
  const email = buildStudentEmail(String(body.roll))
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { roll: body.roll }],
    },
    select: { id: true },
  })

  if (existingUser) {
    throw new Error('An account already exists for this roll number.')
  }

  const otp = await registerOTPGenerator.createToken({
    email,
    roll: body.roll,
  })

  await sendOtpEmail({
    description: `Use this code to verify your registration for roll ${body.roll}.`,
    email: email,
    otp: otp.otp,
    subject: 'Verify your MechoWarts registration',
  })

  return { email: email, token: otp.token }
}

export async function confirmRegisterOTPAction(
  input: z.infer<typeof registerSchema>
) {
  const body = registerSchema.parse(input)
  const payload = await registerOTPGenerator.verifyToken(body.tokens, body.otp)

  if (payload.roll !== body.roll) {
    throw new Error('The verification code does not match this roll.')
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email: payload.email }, { roll: payload.roll }] },
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
      roll: body.roll,
      visibility: body.visibility,
    },
  })

  await setSessionCookie({
    pca: null,
    sub: user.id,
  })

  return { success: true }
}

export async function requestResetPasswordOTPAction(
  input: z.infer<typeof requestOtpSchema>
) {
  const body = requestOtpSchema.parse(input)
  const user = await prisma.user.findUnique({
    where: { roll: body.roll },
    select: {
      id: true,
      email: true,
      passwordChangedAt: true,
    },
  })

  if (!user) {
    throw new Error('No account found for this roll number.')
  }

  const otp = await resetPasswordOTPGenerator.createToken({
    email: user.email,
    roll: body.roll,
    userId: user.id,
  })

  await sendOtpEmail({
    description: `Use this code to reset the password for roll ${body.roll}.`,
    email: user.email,
    otp: otp.otp,
    subject: 'Reset your MechoWarts password',
  })

  return { email: user.email, token: otp.token }
}

export async function confirmResetPasswordOTPAction(
  input: z.infer<typeof resetPasswordSchema>
) {
  const body = resetPasswordSchema.parse(input)
  const payload = await resetPasswordOTPGenerator.verifyToken(
    body.tokens,
    body.otp
  )

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

  const prevPasswordChangedAt = user.passwordChangedAt
  if (
    prevPasswordChangedAt &&
    prevPasswordChangedAt.getTime() >= payload.iat * 1000
  ) {
    throw new Error('This code has already been used. Request a new one.')
  }

  const newPasswordChangedAt = new Date()

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(body.password),
      passwordChangedAt: newPasswordChangedAt,
    },
  })

  await setSessionCookie({
    pca: newPasswordChangedAt.getTime(),
    sub: user.id,
  })

  return { success: true }
}
