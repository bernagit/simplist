import z from 'zod'
import 'dotenv/config'
import { cfg } from './internal.js'
import fs from 'fs'
import path from 'path'

const privkey = fs.readFileSync(path.resolve(process.cwd(), '../../keys/private.key'), 'utf8')
const pubkey = fs.readFileSync(path.resolve(process.cwd(), '../../keys/public.pem'), 'utf8')

const appConfigSchema = z.object({
  appUrl: z.string().default(cfg.DEFAULT_APP_URL),
  port: z.number().default(cfg.DEFAULT_SERVER_PORT),
  logLevel: z
    .enum(['error', 'warn', 'info', 'debug'])
    .default(cfg.DEFAULT_LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug'),
  isDev: z.boolean().default(cfg.DEFAULT_IS_DEV),
  corsOrigin: z.string().default(cfg.DEFAULT_CORS_ORIGIN),
  databaseUrl: z.string(),
  jwtPrivateKey: z.string().default(privkey),
  jwtPublicKey: z.string().default(pubkey),
  jwtExpiresIn: z.string().default(cfg.DEFAULT_JWT_EXPIRES_IN),
  inviteSecret: z.string().nullable().default(null)
})

const appConfig = appConfigSchema.parse({
  appUrl: process.env.APP_URL,
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
  logLevel: process.env.LOG_LEVEL,
  isDev: process.env.NODE_ENV === 'development',
  corsOrigin: process.env.CORS_ORIGIN,
  databaseUrl: process.env.DATABASE_URL,
  jwtPrivateKey: process.env.JWT_PRIVATE_KEY,
  jwtPublicKey: process.env.JWT_PUBLIC_KEY,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  inviteSecret: process.env.INVITE_SECRET
})

export default appConfig
