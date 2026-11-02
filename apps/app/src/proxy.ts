import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { PUBLIC_ROUTES, SESSION_COOKIE } from '@/utils/constants'

/**
 * Page guard only. Auth is enforced by the API on every request; tokens are refreshed by the
 * client (src/utils/ky.ts) when the API answers 401. Here we only check that a session exists,
 * so logged-out users don't see an empty app shell.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hasSession = req.cookies.has(SESSION_COOKIE)
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  if (!hasSession && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (hasSession && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}
