import { z } from 'zod'

const serverEnvSchema = z.object({
  APP_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  DATABASE_URL: z.url(),
  R2_ACCOUNT_ID: z.string().trim().min(1),
  R2_ACCESS_KEY_ID: z.string().trim().min(1),
  R2_SECRET_ACCESS_KEY: z.string().trim().min(1),
  R2_BUCKET: z.string().trim().min(1),
  R2_PUBLIC_URL: z.string().trim().min(1),
})

export const serverEnv = serverEnvSchema.parse({
  APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET: process.env.R2_BUCKET,
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
})
