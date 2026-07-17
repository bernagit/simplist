import { defineConfig } from 'drizzle-kit'
import appConfig from './src/config/env.js'

const getUrl = () => {
  if (!appConfig.databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  return appConfig.databaseUrl
}

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema',
  dialect: 'postgresql',
  dbCredentials: {
    url: getUrl()
  }
})
