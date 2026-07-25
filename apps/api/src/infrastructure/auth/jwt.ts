import jwt from 'jsonwebtoken'
import ms from 'ms'
import type { StringValue } from 'ms'
import appConfig from '../../config/env.js'

const options = {
  algorithm: 'ES384' as jwt.Algorithm,
  expiresIn: appConfig.jwtExpiresIn as StringValue
}

function signToken(payload: object) {
  const token = jwt.sign(payload, appConfig.jwtPrivateKey, options)
  const expiresAt = new Date(Date.now() + ms(appConfig.jwtExpiresIn as StringValue))

  return { token, expiresAt }
}

function verifyToken(token: string) {
  return jwt.verify(token, appConfig.jwtPublicKey)
}

export const jwtService = {
  signToken,
  verifyToken
}
