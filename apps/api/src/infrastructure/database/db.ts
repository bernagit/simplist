import { drizzle } from 'drizzle-orm/node-postgres'
import appConfig from '../../config/env.js'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { cfg } from '../../config/internal.js'
import { createModuleLogger } from '../logging/logger.js'

const logger = createModuleLogger('db')

const db = drizzle(appConfig.databaseUrl)

const runMigrations = async () => {
  logger.info('Running database migrations...')
  await migrate(db, {
    migrationsFolder: cfg.MIGRATION_FOLDER
  })
  logger.info('Database migrations completed successfully.')
}

await runMigrations()
export default db
