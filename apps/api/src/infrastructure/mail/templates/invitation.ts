import { emailLayout } from './layout'

export function inviteTemplate(url: string) {
  return emailLayout(`
<h2>You're invited 🎉</h2>

<p>

You've been invited to join Simplist.

</p>

<p>

<a href="${url}"
style="
display:inline-block;
padding:12px 24px;
background:#111827;
color:white;
text-decoration:none;
border-radius:8px;
">

Accept invitation

</a>

</p>

<p>

If you weren't expecting this email you can safely ignore it.

</p>
`)
}
