import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

function isExpired(expiresAtCookie?: string): boolean {
  if (!expiresAtCookie) return true
  const expiresAt = Number(expiresAtCookie)
  return Number.isNaN(expiresAt) || Date.now() >= expiresAt
}

export async function proxy(req: NextRequest) {
  const accessTokenExpiresAt = req.cookies.get('accessTokenExpiresAt')?.value
  const refreshToken = req.cookies.get('refreshToken')?.value
  const pathname = req.nextUrl.pathname
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  const expired = isExpired(accessTokenExpiresAt)

  if (expired && refreshToken) {
    const refreshRes = await fetch(new URL('/api/auth/refresh', req.url), {
      method: 'POST',
      headers: { cookie: req.headers.get('cookie') ?? '' }
    })

    if (refreshRes.ok) {
      const res = isPublicRoute
        ? NextResponse.redirect(new URL('/', req.url))
        : NextResponse.next()

      const setCookies = refreshRes.headers.getSetCookie()

      setCookies.forEach(cookie => res.headers.append('set-cookie', cookie))
      return res
    }
    return isPublicRoute ? NextResponse.next() : NextResponse.redirect(new URL('/login', req.url))
  }

  const isAuthenticated = !expired

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthenticated && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}
