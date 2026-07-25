/* eslint-disable @typescript-eslint/no-magic-numbers */
import bcrypt from 'bcrypt'

import { createModuleLogger } from '../../infrastructure/logging/logger.js'
import { Errors } from '../../types/http.js'
import { SessionService } from '../session/session.service.js'
import { UserRepository } from '../user/user.repository.js'
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  PasswordResetInput,
  RegisterInput,
  UpdateCurrentUserInput
} from './auth.schema.js'
import {
  generatePasswordResetToken,
  hashInviteToken,
  hashPassword,
  hashPasswordResetToken
} from '../../infrastructure/auth/crypto.js'
import appConfig from '../../config/env.js'
import { mailService } from '../../infrastructure/mail/mail.service.js'
import { PasswordResetRepository } from './passwordReset.repository.js'
import { PreferencesRepository } from '../preferences/preference.repository.js'
import { InviteRepository } from '../invites/invite.repository.js'

export class AuthService {
  private readonly logger = createModuleLogger('AuthService')

  private readonly userRepository = new UserRepository()
  private readonly inviteRepository = new InviteRepository()
  private readonly sessionService = new SessionService()
  private readonly passwordResetRepository = new PasswordResetRepository()
  private readonly preferenceRepository = new PreferencesRepository()

  public async register(data: RegisterInput) {
    const tokenHash = hashInviteToken(data.inviteToken)
    const invite = await this.inviteRepository.findByToken(tokenHash)

    if (!invite) {
      throw Errors.forbidden('Invalid invite token')
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

    // create preferences for the new user
    await this.preferenceRepository.createDefault(user.id)

    if (!user) {
      throw Errors.internal('Failed to create user')
    }

    await this.inviteRepository.markAsUsed(invite.id, data.email)

    const session = await this.sessionService.create({
      userId: user.id
    })

    try {
      const welcomeUrl = `${appConfig.appUrl}`
      await mailService.sendWelcome(user.email, user.name, welcomeUrl)
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${user.email}: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }

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

  public async forgotPassword(data: ForgotPasswordInput) {
    const user = await this.userRepository.findByEmail(data.email)

    const response = {
      message: 'If an account with this email exists, you will receive a password reset link.'
    }

    if (!user) {
      return response
    }

    const existingToken = await this.passwordResetRepository.findActiveByUserId(user.id)

    if (existingToken) {
      return response
    }

    const resetToken = generatePasswordResetToken()
    const hashedToken = hashPasswordResetToken(resetToken)

    const expiresInMinutes = 60
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

    await this.passwordResetRepository.create({
      userId: user.id,
      tokenHash: hashedToken,
      expiresAt
    })

    try {
      const resetUrl = `${appConfig.appUrl}/reset-password?token=${resetToken}&mail=${encodeURIComponent(user.email)}`

      await mailService.sendPasswordReset(user.email, resetUrl, expiresInMinutes)
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${user.email}: ${
          error instanceof Error ? error.message : String(error)
        }`
      )

      throw Errors.internal('Unable to send password reset email')
    }

    return response
  }

  public async resetPassword(data: PasswordResetInput) {
    const hashedToken = hashPasswordResetToken(data.token)
    const passwordResetToken = await this.passwordResetRepository.findByTokenHash(hashedToken)

    if (!passwordResetToken) {
      throw Errors.forbidden('Invalid or expired password reset token')
    }

    if (passwordResetToken.usedAt) {
      throw Errors.forbidden('This password reset token has already been used')
    }

    if (passwordResetToken.expiresAt < new Date()) {
      throw Errors.forbidden('This password reset token has expired')
    }

    const user = await this.userRepository.findById(passwordResetToken.userId)

    if (!user) {
      throw Errors.notFound('User not found')
    }

    const newPasswordHash = await hashPassword(data.newPassword)

    await this.userRepository.updatePassword(user.id, newPasswordHash)
    await this.passwordResetRepository.markAsUsed(passwordResetToken.id)

    return {
      message: 'Password reset successfully'
    }
  }

  public async updateCurrentUser(userId: string, data: UpdateCurrentUserInput) {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw Errors.notFound('User not found')
    }

    const updatedUser = await this.userRepository.update(userId, {
      name: data.name ?? user.name
      // email: data.email ?? user.email
    })

    return updatedUser
  }

  public async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw Errors.notFound('User not found')
    }

    // Verify current password
    const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash)

    if (!isMatch) {
      throw Errors.unauthorized('Current password is incorrect')
    }

    const newPasswordHash = await hashPassword(data.newPassword)

    await this.userRepository.updatePassword(userId, newPasswordHash)
    await this.sessionService.revokeAllForUser(userId) // Revoke all sessions for the user
    return {
      message: 'Password changed successfully'
    }
  }

  public async refresh(refreshToken: string) {
    return this.sessionService.refresh(refreshToken)
  }

  public async logout(refreshToken: string) {
    await this.sessionService.revoke(refreshToken)
    return { message: 'Logout successful' }
  }
}
