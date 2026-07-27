import { cookies } from 'next/headers'
import { REFRESH_MAX_AGE } from './constants'
import { IS_PROD } from './common'

const API_URL = process.env.API_URL!

export async function authFetch(pathOrUrl: string, init: RequestInit = {}) {
  const cookieStore = await cookies()
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${API_URL}${pathOrUrl}`

  const buildHeaders = (token?: string) => {
    const headers = new Headers(init.headers)
    headers.delete('cookie')
    headers.delete('host')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    } else {
      headers.delete('Authorization')
    }
    return headers
  }

  const accessToken = cookieStore.get('accessToken')?.value
  let res = await fetch(url, { ...init, headers: buildHeaders(accessToken) })

  if (res.status === 401) {
    const refreshToken = cookieStore.get('refreshToken')?.value
    if (!refreshToken) return res

    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })

    if (!refreshRes.ok) return res

    const refreshPayload = await refreshRes.json()
    const { accessToken: newAccessToken, accessTokenExpiresAt, refreshToken: newRefreshToken } =
      refreshPayload.data

    cookieStore.set('accessToken', newAccessToken, {
      httpOnly: true, secure: IS_PROD, sameSite: 'lax', path: '/', maxAge: REFRESH_MAX_AGE
    })
    cookieStore.set('accessTokenExpiresAt', new Date(accessTokenExpiresAt).getTime().toString(), {
      httpOnly: true, secure: IS_PROD, sameSite: 'lax', path: '/', maxAge: REFRESH_MAX_AGE
    })
    cookieStore.set('refreshToken', newRefreshToken, {
      httpOnly: true, secure: IS_PROD, sameSite: 'lax', path: '/', maxAge: REFRESH_MAX_AGE
    })

    res = await fetch(url, { ...init, headers: buildHeaders(newAccessToken) })
  }

  return res
}