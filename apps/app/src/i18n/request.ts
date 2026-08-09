import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { defaultLocale, LOCALE_COOKIE_NAME, locales, type Locale } from './config'

async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const savedLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value as Locale | undefined

  // 1. User choice priority: return cookie value if set
  if (savedLocale && locales.includes(savedLocale)) {
    return savedLocale
  }

  // 2. Browser detection fallback: parse Accept-Language header
  const headerStore = await headers()
  const acceptLanguage = headerStore.get('accept-language') || ''
  const languages = new Negotiator({ headers: { 'accept-language': acceptLanguage } }).languages()

  try {
    return match(languages, locales as unknown as string[], defaultLocale) as Locale
  } catch {
    return defaultLocale
  }
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale()

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  }
})