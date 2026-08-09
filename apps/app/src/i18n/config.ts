export const locales = ['en', 'it'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'
export const LOCALE_COOKIE_NAME = 'SIMPLIST_LOCALE'