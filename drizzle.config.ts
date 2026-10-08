import { defineConfig } from 'drizzle-kit'

declare const process: {
  env: {
    DATABASE_URL?: string
  }
}

export default defineConfig({
  schema: './server/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
