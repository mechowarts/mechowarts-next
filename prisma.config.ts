import 'dotenv/config'

import { defineConfig } from 'prisma/config'
import { serverEnv } from './src/env.server'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: serverEnv.DATABASE_URL,
  },
})
