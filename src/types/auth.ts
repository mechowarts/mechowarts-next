import type { Institution } from '@/types/user'

export interface SignInPayload {
  password: string
  rollNumber: number
}

export interface NewUserPayload {
  name: string
  password: string
  rollNumber: number
}

export interface AuthOtpRequestPayload {
  rollNumber: number
}

export interface AuthOtpRequestResponse {
  email: string
  token: string
}

export interface AuthOtpVerifyPayload {
  otp: string
  tokens: string[]
}

export interface AuthOtpVerifyResponse {
  email: string
  rollNumber: number
  success: boolean
}

export interface RegisterOtpPayload {
  email: string
  requestedAt: string
  rollNumber: number
}

export interface RegisterData {
  bio: string
  bloodGroup: string
  confirmPassword: string
  facebookUrl: string
  firstName: string
  homeTown: string
  lastName: string
  password: string
  phone: string
  otp: string
}

export interface RegisterWithOtpPayload extends AuthOtpVerifyPayload {
  bio?: string
  bloodGroup: string
  facebookUrl?: string
  homeTown: string
  name: string
  password: string
  phone?: string
  rollNumber: number
}

export interface ResetPasswordOtpPayload {
  accountUpdatedAt: string
  email: string
  requestedAt: string
  rollNumber: number
  userId: string
}

export interface ResetPasswordPayload extends AuthOtpVerifyPayload {
  password: string
}

export interface ProfileData {
  name: string
  bio: string
  bloodGroup: string
  homeTown: string
  facebook?: string
  whatsapp?: string
  whatsappCountry?: string
  colleges: Institution[]
  schools: Institution[]
}

export type ProgressiveAuthStep = 'roll' | 'login' | 'register'
