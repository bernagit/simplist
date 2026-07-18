import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.text()

  const response = await fetch(`${process.env.API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })
  const payload = await response.json()

  if (!response.ok) {
    return NextResponse.json(payload, {
      status: response.status
    })
  }

  const token = payload.data.accessToken

  const cookieStore = await cookies()

  cookieStore.set('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })

  return NextResponse.json(payload)
}
