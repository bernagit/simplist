import { jwtService } from '../../infrastructure/auth/jwt.js'
import { SessionRepository } from './session.repository.js'
import { generateRefreshToken, hashRefreshToken } from '../../infrastructure/auth/crypto.js'
import { Errors } from '../../types/http.js'
import appConfig from '../../config/env.js'

export class SessionService {
  private repository = new SessionRepository()

  async create(input: { userId: string }) {
    const refreshToken = generateRefreshToken()
    const refreshTokenHash = hashRefreshToken(refreshToken)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + appConfig.refreshTokenExpiresIn)

    const session = await this.repository.create({
      ...input,
      refreshTokenHash,
      expiresAt
    })

    const { token: accessToken, expiresAt: accessTokenExpiresAt } = jwtService.signToken({
      userId: input.userId,
      sessionId: session.id
    })

    return { accessToken, accessTokenExpiresAt, refreshToken, session }
  }

  async refresh(refreshToken: string) {
    const refreshTokenHash = hashRefreshToken(refreshToken)
    const session = await this.repository.findByRefreshTokenHash(refreshTokenHash)

    if (!session) {
      throw Errors.unauthorized('Invalid refresh token')
    }

    if (session.expiresAt < new Date()) {
      await this.repository.deleteById(session.id)
      throw Errors.unauthorized('Refresh token expired')
    }

    // rotate: issue a brand new refresh token, invalidate the old one
    const newRefreshToken = generateRefreshToken()
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken)
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + appConfig.refreshTokenExpiresIn)

    await this.repository.updateRefreshTokenHash(session.id, newRefreshTokenHash, newExpiresAt)
    await this.repository.touch(session.id)

    const { token: accessToken, expiresAt: accessTokenExpiresAt } = jwtService.signToken({
      userId: session.userId,
      sessionId: session.id
    })

    return { accessToken, accessTokenExpiresAt, refreshToken: newRefreshToken }
  }

  async revoke(refreshToken: string) {
    const refreshTokenHash = hashRefreshToken(refreshToken)
    const session = await this.repository.findByRefreshTokenHash(refreshTokenHash)
    if (session) {
      await this.repository.deleteById(session.id)
    }
  }

  async revokeAllForUser(userId: string) {
    await this.repository.deleteByUser(userId)
  }
}
