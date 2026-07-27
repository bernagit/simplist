export const IS_PROD = process.env.NODE_ENV === 'production'

export function createTempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
}