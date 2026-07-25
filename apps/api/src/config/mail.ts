/* eslint-disable @typescript-eslint/no-magic-numbers */
import z from 'zod'

const mailConfigSchema = z.object({
  host: z.string(),
  port: z.number().default(587),
  secure: z.boolean().default(false),
  auth: z.object({
    user: z.string(),
    pass: z.string()
  }),
  from: z.object({
    name: z.string().default('Simplist'),
    email: z.email()
  })
})

const smtpConfigured = [
  process.env.SMTP_HOST,
  process.env.SMTP_PORT,
  process.env.SMTP_USER,
  process.env.SMTP_PASS,
  process.env.MAIL_FROM_EMAIL
].every(Boolean)

const mailConfig = smtpConfigured
  ? mailConfigSchema.parse({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      from: {
        name: process.env.MAIL_FROM_NAME,
        email: process.env.MAIL_FROM_EMAIL
      }
    })
  : null

export default mailConfig
