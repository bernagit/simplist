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
    name: z.string(),
    email: z.email()
  })
})

const mailConfig = mailConfigSchema.parse({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
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

export default mailConfig
