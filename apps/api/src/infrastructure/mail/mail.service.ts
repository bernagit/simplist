import { MailOptions } from 'nodemailer/lib/json-transport'
import mailConfig from '../../config/mail'
import { transporter } from './mail.client'
import { inviteTemplate } from './templates/invitation'
import { welcomeTemplate } from './templates/welcome'
import { resetPasswordTemplate } from './templates/resetPassword'

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
