import mailConfig from '../../config/mail.js'
import { transporter } from './mail.client.js'
import { inviteTemplate } from './templates/invitation.js'
import { welcomeTemplate } from './templates/welcome.js'
import { resetPasswordTemplate } from './templates/resetPassword.js'
import { MailOptions } from 'nodemailer/lib/json-transport/index.js'

class MailService {
  async send(options: MailOptions) {
    return transporter.sendMail({
      from: `"${mailConfig.from.name}" <${mailConfig.from.email}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo
    })
  }

  async sendInvitation(to: string, url: string) {
    await this.send({
      to,
      subject: 'You are invited to join Simplist',
      html: inviteTemplate(url)
    })
  }

  async sendWelcome(to: string, name: string, url: string) {
    await this.send({
      to,
      subject: 'Welcome to Simplist',
      html: welcomeTemplate(name, url)
    })
  }

  async sendPasswordReset(to: string, url: string, expiresInMinutes: number) {
    await this.send({
      to,
      subject: 'Password Reset Request',
      html: resetPasswordTemplate(url, expiresInMinutes)
    })
  }
}

export const mailService = new MailService()
