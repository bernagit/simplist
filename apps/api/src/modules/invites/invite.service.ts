/* eslint-disable @typescript-eslint/no-magic-numbers */
import appConfig from '../../config/env.js'
import { generateInviteToken, hashInviteToken } from '../../infrastructure/auth/crypto.js'
import { createModuleLogger } from '../../infrastructure/logging/logger.js'
import { mailService } from '../../infrastructure/mail/mail.service.js'
import { Errors } from '../../types/http.js'
import { InviteRepository } from './invite.repository.js'
import { InviteInput } from './invite.schema.js'

export class InviteService {
  private readonly logger = createModuleLogger('InviteService')

  private readonly repository = new InviteRepository()

  public async createInvite(userId: string, data: InviteInput) {
    if (appConfig.invitePerUser !== undefined) {
      const count = await this.repository.countByCreator(userId)

      if (count >= appConfig.invitePerUser) {
        throw Errors.forbidden('Invite limit reached for this user')
      }
    }

    if (data.email) {
      const existing = await this.repository.findByEmail(data.email)
      if (existing.some(i => i.revoked === false)) {
        throw Errors.conflict('An invite for this email already exists')
      }
    }

    const token = generateInviteToken()
    const tokenHash = hashInviteToken(token)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const invite = await this.repository.create(userId, {
      email: data.email ?? null,
      tokenHash,
      expiresAt
    })

    if (!invite) {
      throw Errors.internal('Failed to create invite')
    }

    const inviteUrl = `${appConfig.appUrl}/register?token=${token}`
    // if email is provided, send the invite email
    if (data.email) {
      try {
        await mailService.sendInvitation(data.email, inviteUrl)
        return {
          inviteUrl,
          token
        }
      } catch (error) {
        this.logger.error(
          `Failed to send invitation email to ${data.email}: ${
            error instanceof Error ? error.message : String(error)
          }`
        )

        // delete the invite if email sending fails
        await this.repository.deleteByEmail(data.email)
        throw Errors.internal('Unable to send invitation email')
      }
    } // otherwise, return the invite URL and token for manual sharing
    else {
      return {
        inviteUrl,
        token
      }
    }
  }

  public async getInvites(userId: string) {
    const invites = await this.repository.findByCreator(userId)
    return invites
  }

  public async checkInvite(token: string) {
    const tokenHash = hashInviteToken(token)

    const invite = await this.repository.isValidInvite(tokenHash)

    if (!invite) {
      throw Errors.forbidden('Invalid invite token')
    }

    return {
      email: invite.email
    }
  }

  public async revokeInvite(userId: string, inviteId: string) {
    const revoked = await this.repository.revokeInvite(userId, inviteId)

    if (!revoked) {
      throw Errors.notFound('Invite not found or already used/revoked')
    }

    return {
      id: revoked.id,
      email: revoked.email,
      revoked: revoked.revoked
    }
  }
}
