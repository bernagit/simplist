import { drizzle } from 'drizzle-orm/node-postgres'
import appConfig from '../../config/env.js'

const db = drizzle(appConfig.databaseUrl)

export default db
