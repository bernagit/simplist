import { emailColors } from './layout'

interface EmailButtonOptions {
  href: string
  label: string
  color?: string
}

/**
 * Renders a CTA button that works across email clients, including a
 * VML fallback so it stays a solid rounded rectangle in Outlook desktop
 * (which ignores border-radius and padding-based buttons otherwise).
 */
export function emailButton({ href, label, color = emailColors.primary }: EmailButtonOptions) {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 8px 0;">
  <tr>
    <td align="center" style="border-radius: 8px;" bgcolor="${color}">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="16%" stroke="f" fillcolor="${color}">
      <w:anchorlock/>
      <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${label}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${href}" target="_blank" style="
        display: inline-block;
        padding: 14px 28px;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 15px;
        font-weight: bold;
        color: #ffffff;
        text-decoration: none;
        border-radius: 8px;
      ">${label}</a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`
}
