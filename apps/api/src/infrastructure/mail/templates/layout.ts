export const emailColors = {
  primary: '#E64980',
  primaryDark: '#D6336C',
  primaryLight: '#FFF0F6',
  text: '#1A1B1E',
  textMuted: '#868E96',
  border: '#E9ECEF',
  background: '#F8F9FA',
  white: '#FFFFFF'
}

interface EmailLayoutOptions {
  /** Hidden preview text shown next to the subject line in inbox lists */
  preheader?: string
}

export function emailLayout(content: string, options: EmailLayoutOptions = {}) {
  const { preheader = '' } = options

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
<title>Simplist</title>
<style>
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
  body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; background-color: ${emailColors.background}; }

  @media only screen and (max-width: 600px) {
    .email-container { width: 100% !important; }
    .email-padding { padding-left: 24px !important; padding-right: 24px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:${emailColors.background};">
  ${
    preheader
      ? `<div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:${emailColors.background};">
    ${preheader}
  </div>`
      : ''
  }

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${emailColors.background};">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px;">

          <!-- Wordmark -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <span style="font-family: Arial, Helvetica, sans-serif; font-size: 22px; font-weight: 700; color: ${emailColors.primary}; letter-spacing: -0.02em;">
                Simplist
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td class="email-padding" style="background-color: ${emailColors.white}; border-radius: 16px; padding: 48px; border: 1px solid ${emailColors.border};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 24px; color: ${emailColors.text};">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 20px; color: ${emailColors.textMuted}; padding-bottom: 8px;">
                    Simplist &middot; Keep your lists together
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 18px; color: ${emailColors.textMuted};">
                    You're receiving this email because of activity on your Simplist account.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`
}
