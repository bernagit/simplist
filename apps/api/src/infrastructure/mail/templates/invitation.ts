import { emailLayout, emailColors } from './layout.js'
import { emailButton } from './button.js'

interface InviteOptions {
  inviterName?: string
  listName?: string
}

export function inviteTemplate(url: string, options: InviteOptions = {}) {
  const { inviterName, listName } = options

  const introLine = inviterName
    ? `<strong>${inviterName}</strong> invited you to join Simplist${
        listName ? ` and collaborate on <strong>${listName}</strong>` : ''
      }.`
    : `You've been invited to join Simplist.`

  const preheaderText = introLine.replace(/<[^>]+>/g, '')

  return emailLayout(
    `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding-bottom: 20px;">
          <span style="font-size: 20px; font-weight: 700; color: ${emailColors.text};">You're invited 🎉</span>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 28px; color: ${emailColors.text}; font-size: 15px; line-height: 24px;">
          ${introLine}
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom: 28px;">
          ${emailButton({ href: url, label: 'Accept invitation' })}
        </td>
      </tr>
      <tr>
        <td style="border-top: 1px solid ${emailColors.border}; padding-top: 20px; font-size: 13px; line-height: 20px; color: ${emailColors.textMuted};">
          If you weren't expecting this invitation, you can safely ignore this email — no account will be created without your confirmation.
        </td>
      </tr>
    </table>
  `,
    { preheader: preheaderText }
  )
}
