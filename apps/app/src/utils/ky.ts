import ky, { type AfterResponseHook } from 'ky'
import { PUBLIC_ROUTES } from '@/utils/constants'

/**
 * The browser calls the Express API directly on the same origin (/api, routed by nginx in
 * production and by a Next.js rewrite in development). Auth lives in httpOnly cookies set by
 * the API, so there are no tokens to attach here: we only handle expiry.
 *
 * When a request gets 401 (the access cookie expired, so the browser stopped sending it):
 * 1. refresh once, shared by every request that fails at the same time (refresh tokens are
 *    single-use: parallel refreshes would invalidate each other);
 * 2. retry the request once, even if our refresh failed: another tab may have rotated the
 *    token a moment earlier, and the browser already has its fresh cookies;
 * 3. still 401: the session is over, log out and go to the login page.
 */

/** Endpoints whose 401 means "wrong credentials", not "expired session". */
const NO_REFRESH_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password'
]

let refreshInFlight: Promise<boolean> | null = null

function refreshSession(): Promise<boolean> {
  refreshInFlight ??= fetch('/api/auth/refresh', { method: 'POST', cache: 'no-store' })
    .then(res => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null
    })
  return refreshInFlight
}

let sessionExpired = false

function endSession() {
  if (sessionExpired) return
  sessionExpired = true
  // Logout clears every auth cookie, including the one the middleware checks
  void fetch('/api/auth/logout', { method: 'POST' })
    .catch(() => {})
    .finally(() => {
      const onPublicRoute = PUBLIC_ROUTES.some(route => window.location.pathname.startsWith(route))
      if (!onPublicRoute) window.location.assign('/login')
    })
}

const refreshOnUnauthorized: AfterResponseHook = async ({ request, response, retryCount }) => {
  if (response.status !== 401 || retryCount > 0) return

  const path = new URL(request.url).pathname
  if (NO_REFRESH_PATHS.some(p => path.startsWith(p))) return

  await refreshSession()

  // Plain ky: no hooks, so this can't loop. Errors are thrown by the caller's ky as usual.
  const retried = await ky(request, { throwHttpErrors: false, retry: 0 })
  if (retried.status === 401) endSession()
  return retried
}

const api = ky.extend({
  prefix: '/api',
  cache: 'no-store',
  hooks: {
    afterResponse: [refreshOnUnauthorized]
  }
})

export default api
