import { IS_PROD } from '@/utils/common'
import { REFRESH_MAX_AGE } from '@/utils/constants'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  const response = await fetch(`${process.env.API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  const payload = await response.json()

  if (!response.ok) {
    return NextResponse.json(payload, {
      status: response.status
    })
  }

  const { accessToken, accessTokenExpiresAt, refreshToken, user } = payload.data
  const cookieStore = await cookies()

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

  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_MAX_AGE
  })

  return NextResponse.json({ message: payload.message, data: { user } })
}
