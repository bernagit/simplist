import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

export function proxy(req: NextRequest) {
  const token = req.cookies.get('accessToken')?.value

  const pathname = req.nextUrl.pathname

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (token && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}
