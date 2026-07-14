export function emailLayout(content: string) {
  return `
<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width">

</head>

<body style="
background:#f5f5f5;
font-family:Arial,sans-serif;
padding:40px;
">

<table width="600" align="center">

<tr>

<td style="
background:white;
padding:40px;
border-radius:12px;
">

${content}

</td>

</tr>

</table>

</body>

</html>
`
}
