/* eslint-disable @typescript-eslint/no-magic-numbers */

import { jwtService } from '../../infrastructure/auth/jwt'
import { SessionRepository } from './session.repository'
import { generateRefreshToken, hashRefreshToken } from '../../infrastructure/auth/crypto'

export class SessionService {
  private repository = new SessionRepository()

  async create(input: { userId: string }) {
    const refreshToken = generateRefreshToken()

    const refreshTokenHash = hashRefreshToken(refreshToken)

    const expiresAt = new Date()

    expiresAt.setDate(expiresAt.getDate() + 30)

    const session = await this.repository.create({
      ...input,
      refreshTokenHash,
      expiresAt
    })

    const accessToken = jwtService.signToken({
      userId: input.userId,
      sessionId: session.id
    })

    return {
      accessToken,
      refreshToken,
      session
    }
  }
}
