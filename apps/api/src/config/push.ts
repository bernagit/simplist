import z from 'zod'
import 'dotenv/config'
import appConfig from './env.js'

/**
 * Web Push (VAPID). Optional: without keys, reminders are off and the app says so.
 * Generate a key pair once with `yarn workspace api push:keys` and keep it: changing it
 * invalidates every device subscription.
 */
const pushConfigSchema = z.object({
  publicKey: z.string().min(1),
  privateKey: z.string().min(1),
  /** Contact for push services, `mailto:` or `https:` URL */
  subject: z
    .string({ error: 'Set VAPID_SUBJECT to a mailto: or https: URL (or set MAIL_FROM_EMAIL)' })
    .regex(/^(mailto:|https:\/\/)/, 'VAPID_SUBJECT must be a mailto: or https: URL')
})

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, MAIL_FROM_EMAIL } = process.env

function defaultSubject() {
  if (MAIL_FROM_EMAIL) return `mailto:${MAIL_FROM_EMAIL}`
  return appConfig.appUrl.startsWith('https://') ? appConfig.appUrl : undefined
}

const pushConfig =
  VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY
    ? pushConfigSchema.parse({
        publicKey: VAPID_PUBLIC_KEY,
        privateKey: VAPID_PRIVATE_KEY,
        subject: VAPID_SUBJECT ?? defaultSubject()
      })
    : null

export default pushConfig
