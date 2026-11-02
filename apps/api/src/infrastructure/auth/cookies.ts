import type { CookieOptions, Request, Response } from 'express'
import ms from 'ms'
import appConfig from '../../config/env.js'

/**
 * Browser auth: the API sets httpOnly cookies itself, so tokens never reach JavaScript.
 * Non-browser clients keep using `Authorization: Bearer <token>`.
 *
 * - access:  the JWT. Path /api, expires with the token, so an expired token is simply not sent.
 * - refresh: the refresh token. Path /api/auth, only sent to refresh/logout.
 * - session: no secret, just "a session exists". Path / so the Next.js middleware can read it
 *            to protect pages. The API never trusts it.
 */
export const AUTH_COOKIES = {
  access: 'sl_access',
  refresh: 'sl_refresh',
  session: 'sl_session'
} as const

const DAY_MS = ms('1d')

const base: CookieOptions = {
  httpOnly: true,
  secure: appConfig.cookieSecure,
  // Only used by same-origin fetch calls: never sent with cross-site requests (CSRF)
  sameSite: 'strict'
}

const cookieOptions = {
  access: { ...base, path: '/api' },
  refresh: { ...base, path: '/api/auth' },
  // lax: must be sent on top-level navigations from other sites (e.g. a link in an email),
  // or the middleware would treat the user as logged out
  session: { ...base, sameSite: 'lax', path: '/' }
} satisfies Record<keyof typeof AUTH_COOKIES, CookieOptions>

type SessionTokens = {
  accessToken: string
  accessTokenExpiresAt: Date
  refreshToken: string
}

export function setAuthCookies(res: Response, tokens: SessionTokens) {
  const refreshMaxAge = appConfig.refreshTokenExpiresIn * DAY_MS

  res.cookie(AUTH_COOKIES.access, tokens.accessToken, {
    ...cookieOptions.access,
    maxAge: Math.max(0, tokens.accessTokenExpiresAt.getTime() - Date.now())
  })
  res.cookie(AUTH_COOKIES.refresh, tokens.refreshToken, {
    ...cookieOptions.refresh,
    maxAge: refreshMaxAge
  })
  res.cookie(AUTH_COOKIES.session, '1', { ...cookieOptions.session, maxAge: refreshMaxAge })
}

export function clearAuthCookies(res: Response) {
  for (const name of Object.keys(AUTH_COOKIES) as (keyof typeof AUTH_COOKIES)[]) {
    res.clearCookie(AUTH_COOKIES[name], cookieOptions[name])
  }
}

/** Minimal cookie reader, to avoid adding cookie-parser for three cookies. */
export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie
  if (!header) return undefined

  for (const part of header.split(';')) {
    const separator = part.indexOf('=')
    if (separator === -1) continue
    if (part.slice(0, separator).trim() !== name) continue

    const value = part.slice(separator + 1).trim()
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }
  return undefined
}
