import { drizzle } from 'drizzle-orm/node-postgres'
import appConfig from '../../config/env'

const db = drizzle(appConfig.databaseUrl)

export default db
