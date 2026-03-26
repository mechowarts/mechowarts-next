'use server'

import 'server-only'

import { auth } from '@/server/lib/auth'
import { sendOtpEmail } from '@/server/lib/mailer'
import { hashPassword } from '@/server/lib/password'
import { prisma } from '@/server/lib/prisma'
import {
  authOtpTokenLimit,
  createRegisterOtp,
  createResetPasswordOtp,
  verifyRegisterOtp,
  verifyResetPasswordOtp,
} from '@/server/helpers/auth-otp'
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
  bio: z.string().optional(),
  bloodGroup: z.string().min(1),
  facebookUrl: z.union([z.literal(''), z.url()]).optional(),
  homeTown: z.string().min(1),
  name: z.string().min(1),
  otp: z.string().length(6),
  password: z.string().min(8),
  phone: z.string().optional(),
  rollNumber: z.number().int().positive(),
  tokens: z.array(z.string().min(1)).min(1).max(authOtpTokenLimit),
})

const resetPasswordSchema = z.object({
  otp: z.string().length(6),
  password: z.string().min(8),
  tokens: z.array(z.string().min(1)).min(1).max(authOtpTokenLimit),
})

export async function requestRegisterOtp(
  input: z.infer<typeof requestOtpSchema>
) {
  const body = requestOtpSchema.parse(input)
  const email = buildStudentEmail(String(body.rollNumber))
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { rollNumber: body.rollNumber }],
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
      OR: [{ email: payload.email }, { rollNumber: payload.rollNumber }],
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
      OR: [{ email: payload.email }, { rollNumber: payload.rollNumber }],
    },
    select: { id: true },
  })

  if (existingUser) {
    throw new Error('This roll number is already registered.')
  }

  await auth.api.signUpEmail({
    body: {
      avatarUrl: '',
      bio: body.bio,
      bloodGroup: body.bloodGroup,
      email: payload.email,
      facebookUrl: body.facebookUrl,
      homeTown: body.homeTown,
      isPublic: true,
      name: body.name,
      password: body.password,
      phone: body.phone,
      rollNumber: payload.rollNumber,
    },
  })

  return { success: true }
}

export async function requestResetPasswordOtp(
  input: z.infer<typeof requestOtpSchema>
) {
  const body = requestOtpSchema.parse(input)
  const user = await prisma.user.findUnique({
    where: { rollNumber: body.rollNumber },
    select: {
      id: true,
      email: true,
    },
  })

  if (!user) {
    throw new Error('No account found for this roll number.')
  }

  const credentialAccount = await prisma.account.findFirst({
    where: {
      providerId: 'credential',
      userId: user.id,
    },
    select: {
      updatedAt: true,
    },
  })

  if (!credentialAccount) {
    throw new Error('Password sign-in is not available for this user.')
  }

  const otp = await createResetPasswordOtp({
    accountUpdatedAt: credentialAccount.updatedAt.toISOString(),
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
  const credentialAccount = await prisma.account.findFirst({
    where: {
      providerId: 'credential',
      userId: payload.userId,
    },
    select: {
      updatedAt: true,
    },
  })

  if (!credentialAccount) {
    throw new Error('Password sign-in is not available for this user.')
  }

  if (
    credentialAccount.updatedAt.getTime() >
    new Date(payload.accountUpdatedAt).getTime()
  ) {
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
    select: { id: true },
  })

  if (!user) {
    throw new Error('User not found.')
  }

  const credentialAccount = await prisma.account.findFirst({
    where: {
      userId: user.id,
      providerId: 'credential',
    },
    select: { id: true, updatedAt: true },
  })

  if (!credentialAccount) {
    throw new Error('Credential account not found.')
  }

  if (
    credentialAccount.updatedAt.getTime() >
    new Date(payload.accountUpdatedAt).getTime()
  ) {
    throw new Error('This code has already been used. Request a new one.')
  }

  await prisma.account.update({
    where: { id: credentialAccount.id },
    data: {
      password: await hashPassword(body.password),
    },
  })

  await prisma.session.deleteMany({ where: { userId: user.id } })

  return { rollNumber: payload.rollNumber, success: true }
}
