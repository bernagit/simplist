import nodemailer from 'nodemailer'
import mailConfig from '../../config/mail.js'

export const transporter = mailConfig
  ? nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: mailConfig.auth,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 10
    })
  : null
