import { z } from 'zod'

const serverEnvSchema = z.object({
  APP_URL: z.url(),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),

  R2_BUCKET: z.string().trim().min(1),
  R2_PUBLIC_URL: z.string().trim().min(1),
  R2_ACCOUNT_ID: z.string().trim().min(1),
  R2_ACCESS_KEY_ID: z.string().trim().min(1),
  R2_SECRET_ACCESS_KEY: z.string().trim().min(1),

  GMAIL_ADDRESS: z.email(),
  GMAIL_PASSWORD: z.string().min(8),
})

export const serverEnv = serverEnvSchema.parse({
  ...process.env,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})
