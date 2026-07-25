import { IS_PROD } from '@/utils/common'
import { REFRESH_MAX_AGE } from '@/utils/constants'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refreshToken')?.value

  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token' }, { status: 401 })
  }

  const response = await fetch(`${process.env.API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  })
  const payload = await response.json()

  if (!response.ok) {
    cookieStore.delete('accessToken')
    cookieStore.delete('refreshToken')
    return NextResponse.json(payload, { status: response.status })
  }

  const { accessToken, accessTokenExpiresAt, refreshToken: newRefreshToken } = payload.data

  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_MAX_AGE
  })

  cookieStore.set('accessTokenExpiresAt', new Date(accessTokenExpiresAt).getTime().toString(), {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_MAX_AGE
  })

  cookieStore.set('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_MAX_AGE
  })

  return NextResponse.json({ message: 'Token refreshed' })
}