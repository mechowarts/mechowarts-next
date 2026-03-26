import { z } from 'zod'

const serverEnvSchema = z.object({
  APP_URL: z.url(),
  DATABASE_URL: z.url(),

  JWT_SECRET: z.string(),
  JWT_REGISTER_SECRET: z.string(),
  JWT_RESET_PASSWORD_SECRET: z.string(),

  R2_BUCKET: z.string().trim(),
  R2_PUBLIC_URL: z.string().trim(),
  R2_ACCOUNT_ID: z.string().trim(),
  R2_ACCESS_KEY_ID: z.string().trim(),
  R2_SECRET_ACCESS_KEY: z.string().trim(),

  GMAIL_ADDRESS: z.email(),
  GMAIL_PASSWORD: z.string(),
})

export const serverEnv = serverEnvSchema.parse({
  ...process.env,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})
