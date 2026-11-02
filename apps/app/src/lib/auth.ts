import { cookies } from 'next/headers'
import { SESSION_COOKIE } from '@/utils/constants'

export async function hasSessionCookie() {
  const cookieStore = await cookies()
  return cookieStore.has(SESSION_COOKIE)
}
