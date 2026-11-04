import z from 'zod'
import 'dotenv/config'
import appConfig from './env.js'
import { secrets } from './secrets.js'

/**
 * Web Push (VAPID). The key pair is created on first start (see secrets.ts), or comes from
 * VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY. Changing it invalidates every device subscription.
 */
const pushConfigSchema = z.object({
  publicKey: z.string().min(1),
  privateKey: z.string().min(1),
  /** Contact for push services, `mailto:` or `https:` URL */
  subject: z
    .string()
    .regex(/^(mailto:|https:\/\/)/, 'VAPID_SUBJECT must be a mailto: or https: URL')
})

const { VAPID_SUBJECT, MAIL_FROM_EMAIL } = process.env

/**
 * Push services only use the contact to reach the admin about abuse. An instance on plain HTTP
 * with no email can't receive push anyway (browsers require HTTPS): a placeholder keeps it
 * starting instead of failing.
 */
function defaultSubject() {
  if (MAIL_FROM_EMAIL) return `mailto:${MAIL_FROM_EMAIL}`
  if (appConfig.appUrl.startsWith('https://')) return appConfig.appUrl
  return 'mailto:admin@example.com'
}

const pushConfig = pushConfigSchema.parse({
  publicKey: secrets.vapid.publicKey,
  privateKey: secrets.vapid.privateKey,
  subject: VAPID_SUBJECT ?? defaultSubject()
})

export default pushConfig
