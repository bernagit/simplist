/* eslint-disable @typescript-eslint/no-magic-numbers */
import crypto from 'crypto'
import bcrypt from 'bcrypt'

export function generateInviteToken() {
  return crypto.randomBytes(32).toString('base64url')
}

export function hashInviteToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString('base64url')
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}
