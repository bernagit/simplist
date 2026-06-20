import z from 'zod'
import 'dotenv/config'
import { cfg } from './internal'
import fs from 'fs'

const privkey = fs.readFileSync(new URL('../../../../keys/private.key', import.meta.url), 'utf8')
const pubkey = fs.readFileSync(new URL('../../../../keys/public.pem', import.meta.url), 'utf8')

const appConfigSchema = z.object({
  port: z.number().default(cfg.DEFAULT_SERVER_PORT),
  logLevel: z
    .enum(['error', 'warn', 'info', 'debug'])
    .default(cfg.DEFAULT_LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug'),
  isDev: z.boolean().default(cfg.DEFAULT_IS_DEV),
  databaseUrl: z.string(),
  jwtPrivateKey: z.string().default(privkey),
  jwtPublicKey: z.string().default(pubkey),
  jwtExpiresIn: z.string().default(cfg.DEFAULT_JWT_EXPIRES_IN)
})

const appConfig = appConfigSchema.parse({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
  logLevel: process.env.LOG_LEVEL,
  isDev: process.env.NODE_ENV === 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtPrivateKey: process.env.JWT_PRIVATE_KEY,
  jwtPublicKey: process.env.JWT_PUBLIC_KEY,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN
})

export default appConfig
