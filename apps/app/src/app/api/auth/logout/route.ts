import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refreshToken')?.value

  if (refreshToken) {
    await fetch(`${process.env.API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    }).catch(() => {}) // clear cookies even if this fails
  }
  console.log('Deleting cookies')
  cookieStore.delete('accessToken')
  cookieStore.delete('accessTokenExpiresAt')
  cookieStore.delete('refreshToken')

  return Response.json({
    message: 'Logout successful'
  })
}
