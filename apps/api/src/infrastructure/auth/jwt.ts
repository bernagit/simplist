import jwt from 'jsonwebtoken'
import type { StringValue } from 'ms'
import appConfig from '../../config/env'

const options = {
  algorithm: 'ES384' as jwt.Algorithm,
  expiresIn: appConfig.jwtExpiresIn as StringValue
}

function signToken(payload: object) {
  return jwt.sign(payload, appConfig.jwtPrivateKey, options)
}

function verifyToken(token: string) {
  return jwt.verify(token, appConfig.jwtPublicKey)
}

export const jwtService = {
  signToken,
  verifyToken
}
