import { rollNumberPattern, studentEmailDomain } from '@/constants/auth'

export function buildStudentEmail(roll: string) {
  return `${roll}${studentEmailDomain}`
}

export function getDisplayName(name: string) {
  const parts = name.trim().split(/\s+/)

  if (parts.length === 0) {
    return ''
  }

  if (parts.length === 3) {
    return parts[1]
  }

  return parts[0]
}

export function isValidRollNumber(roll: string) {
  return rollNumberPattern.test(roll)
}

export function normalizeWhatsappPhone(phone: string) {
  return phone.replace(/\D/g, '')
}
