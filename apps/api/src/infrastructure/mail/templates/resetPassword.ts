/* eslint-disable @typescript-eslint/no-magic-numbers */
import { emailLayout, emailColors } from './layout'
import { emailButton } from './button'

export function resetPasswordTemplate(url: string, expiresInMinutes = 60) {
  return emailLayout(
    `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding-bottom: 20px;">
          <span style="font-size: 20px; font-weight: 700; color: ${emailColors.text};">Reset your password</span>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 28px; color: ${emailColors.text}; font-size: 15px; line-height: 24px;">
          We received a request to reset the password for your Simplist account. This link expires in ${expiresInMinutes} minutes.
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom: 28px;">
          ${emailButton({ href: url, label: 'Reset password' })}
        </td>
      </tr>
      <tr>
        <td style="border-top: 1px solid ${emailColors.border}; padding-top: 20px; font-size: 13px; line-height: 20px; color: ${emailColors.textMuted};">
          If you didn't request this, you can safely ignore this email — your password will remain unchanged.
        </td>
      </tr>
    </table>
  `,
    { preheader: 'Reset your Simplist password.' }
  )
}
