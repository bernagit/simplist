import { defineConfig } from 'drizzle-kit'
import appConfig from './src/config/env.js'
import { cfg } from './src/config/internal.js'

const getUrl = () => {
  if (!appConfig.databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  return appConfig.databaseUrl
}

const getMigrationsFolder = () => {
  if (!cfg.MIGRATION_FOLDER) {
    throw new Error('MIGRATION_FOLDER is not set in the configuration')
  }
  return cfg.MIGRATION_FOLDER
}

export default defineConfig({
  out: getMigrationsFolder(),
  schema: './src/db/schema',
  dialect: 'postgresql',
  dbCredentials: {
    url: getUrl()
  }
})
