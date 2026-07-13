import bcrypt from 'bcrypt'

import { createModuleLogger } from '../../infrastructure/logging/logger'
import { Errors } from '../../types/http'
import { SessionService } from '../session/session.service'
import { UserRepository } from '../user/user.repository'
import { InviteRepository } from './invite.repository'
import { LoginInput, RegisterInput } from './auth.schema'
import {
  generateInviteToken,
  hashInviteToken,
  hashPassword
} from '../../infrastructure/auth/crypto'
import appConfig from '../../config/env'

export class AuthService {
  private readonly logger = createModuleLogger('AuthService')

  private readonly userRepository = new UserRepository()

  private readonly inviteRepository = new InviteRepository()

  private readonly sessionService = new SessionService()

  public async createInvite(data: { email: string; secret: string }) {
    const inviteSecret = appConfig.inviteSecret

    if (inviteSecret === null || inviteSecret === undefined) {
      throw Errors.internal('Invite secret is not configured')
    }

    if (data.secret !== inviteSecret) {
      throw Errors.unauthorized('Invalid invite secret')
    }

    const existingInvite = await this.inviteRepository.findByEmail(data.email)

    if (existingInvite) {
      throw Errors.conflict('An invite for this email already exists')
    }

    const token = generateInviteToken()
    const tokenHash = hashInviteToken(token)

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

    const invite = await this.inviteRepository.create({
      email: data.email,
      token: tokenHash,
      expiresAt
    })

    if (!invite) {
      throw Errors.internal('Failed to create invite')
    }

    return {
      email: invite.email,
      token, // Return the plain token to the user
      expiresAt: invite.expiresAt
    }
  }

  public async register(data: RegisterInput) {
    const invite = await this.inviteRepository.findByEmail(data.email)

    const tokenHash = hashInviteToken(data.inviteToken)

    if (!invite || invite.token !== tokenHash) {
      throw Errors.forbidden('Invalid invite token')
    }

    if (!invite) {
      throw Errors.forbidden('This email has not been invited to the beta')
    }

    if (invite.used) {
      throw Errors.forbidden('This invitation has already been used')
    }

    if (invite.expiresAt < new Date()) {
      throw Errors.forbidden('This invitation has expired')
    }

    const existingUser = await this.userRepository.findByEmail(data.email)

    if (existingUser) {
      throw Errors.conflict('User with this email already exists')
    }

    const passwordHash = await hashPassword(data.password)

    const user = await this.userRepository.createUser({
      name: data.name || data.email,
      email: data.email,
      passwordHash
    })

    if (!user) {
      throw Errors.internal('Failed to create user')
    }

    await this.inviteRepository.markAsUsed(invite.id)

    const session = await this.sessionService.create({
      userId: user.id
    })

    return {
      user,
      ...session
    }
  }

  public async loginWithPassword(data: LoginInput) {
    const user = await this.userRepository.findByEmail(data.email)

    if (!user) {
      throw Errors.unauthorized('Invalid email or password')
    }

    if (!user.passwordHash) {
      throw Errors.unauthorized('This account has no password')
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash)

    if (!isMatch) {
      throw Errors.unauthorized('Invalid email or password')
    }

    return this.sessionService.create({
      userId: user.id
    })
  }
}
