import mailConfig from '../../config/mail'
import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  secure: mailConfig.secure,

  auth: mailConfig.auth,
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateLimit: 10
})
