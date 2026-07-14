import { emailLayout, emailColors } from './layout'
import { emailButton } from './button'

export function welcomeTemplate(name: string, url: string) {
  return emailLayout(
    `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding-bottom: 20px;">
          <span style="font-size: 20px; font-weight: 700; color: ${emailColors.text};">Welcome to Simplist, ${name} 👋</span>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 28px; color: ${emailColors.text}; font-size: 15px; line-height: 24px;">
          Your account is ready. Start by creating your first list, or invite someone to collaborate with you.
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom: 8px;">
          ${emailButton({ href: url, label: 'Go to Simplist' })}
        </td>
      </tr>
    </table>
  `,
    { preheader: 'Your Simplist account is ready.' }
  )
}
