import z from 'zod'
import 'dotenv/config'
import { cfg } from './internal.js'
import fs from 'fs'
import path from 'path'

const privkey = fs.readFileSync(path.resolve(process.cwd(), '../../keys/private.key'), 'utf8')
const pubkey = fs.readFileSync(path.resolve(process.cwd(), '../../keys/public.pem'), 'utf8')

const appConfigSchema = z.object({
  appUrl: z.string().default(cfg.DEFAULT_APP_URL),
  port: z.coerce.number().default(cfg.DEFAULT_SERVER_PORT),
  logLevel: z
    .enum(['error', 'warn', 'info', 'debug'])
    .default(cfg.DEFAULT_LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug'),
  isDev: z.boolean().default(cfg.DEFAULT_IS_DEV),
  corsOrigin: z.string().default(cfg.DEFAULT_CORS_ORIGIN),
  databaseUrl: z.string(),
  jwtPrivateKey: z.string().default(privkey),
  jwtPublicKey: z.string().default(pubkey),
  jwtExpiresIn: z.string().default(cfg.DEFAULT_JWT_EXPIRES_IN),
  // coerce: env values are strings, z.number() rejected REFRESH_TOKEN_EXPIRES_IN_DAYS when set
  refreshTokenExpiresIn: z.coerce
    .number()
    .int()
    .positive()
    .default(cfg.REFRESH_TOKEN_EXPIRES_IN_DAYS),
  // Secure cookies need HTTPS. Defaults to on outside development; set COOKIE_SECURE=false
  // only if production is served over plain HTTP (e.g. on a LAN).
  cookieSecure: z.boolean(),
  invitePerUser: z.coerce.number().int().positive().optional()
})

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST, POSTGRES_PORT } = process.env

const appConfig = appConfigSchema.parse({
  appUrl: process.env.APP_URL,
  port: process.env.PORT,
  logLevel: process.env.LOG_LEVEL,
  isDev: process.env.NODE_ENV === 'development',
  corsOrigin: process.env.CORS_ORIGIN,
  databaseUrl:
    process.env.DATABASE_URL ??
    `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`,
  jwtPrivateKey: process.env.JWT_PRIVATE_KEY,
  jwtPublicKey: process.env.JWT_PUBLIC_KEY,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS,
  invitePerUser: process.env.INVITE_PER_USER,
  cookieSecure:
    process.env.COOKIE_SECURE !== undefined
      ? process.env.COOKIE_SECURE === 'true'
      : process.env.NODE_ENV !== 'development'
})

export default appConfig
