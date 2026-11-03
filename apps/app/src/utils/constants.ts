export const PRIORITY_CONFIG = [
  { value: 'high', labelKey: 'high', color: 'red' },
  { value: 'medium', labelKey: 'medium', color: 'yellow' },
  { value: 'low', labelKey: 'low', color: 'blue' },
  { value: null, labelKey: 'none', color: 'dimmed' }
] as const

export const RECURRENCE_CONFIG = [
  { value: 'NONE', labelKey: 'none' },
  { value: 'FREQ=DAILY', labelKey: 'daily' },
  { value: 'FREQ=WEEKLY', labelKey: 'weekly' },
  { value: 'FREQ=MONTHLY', labelKey: 'monthly' }
] as const

/**
 * Set by the API next to the httpOnly auth cookies (must match AUTH_COOKIES.session in
 * apps/api/src/infrastructure/auth/cookies.ts). It holds no secret: it only tells the Next.js
 * middleware that a session exists, to protect pages. The API checks the real tokens.
 */
export const SESSION_COOKIE = 'sl_session'

/** Query parameter of a list page that opens one of its tasks: `/lists/<id>?task=<taskId>` */
export const TASK_QUERY_PARAM = 'task'

/** Pages reachable without a session. */
export const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

/** Must match `site` in apps/docs/astro.config.ts */
export const DOCS_URL = 'https://docs.simplist.app.bernitec.it'
