export interface Institution {
  name: string
  location?: string
}

export interface User {
  id: string
  accountId?: string
  name: string
  email: string
  rollNumber?: number
  avatarUrl: string
  bio: string
  bloodGroup?: string
  homeTown?: string
  colleges?: Institution[]
  schools?: Institution[]
  isPublic?: boolean
  phone?: string
  facebookUrl?: string
  status?: string
  isVerified?: boolean
}
