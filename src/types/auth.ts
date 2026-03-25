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

export interface ResetPasswordPayload {
  password: string
  rollNumber: number
}

export interface RegisterData {
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
  gender: string
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

export type ProgressiveAuthStep =
  | 'roll'
  | 'login'
  | 'register'
  | 'profile'
  | 'logged-in'
