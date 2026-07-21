// src/bootstrap/first-invite.ts
import { createModuleLogger } from '../infrastructure/logging/logger.js'
import appConfig from '../config/env.js'
import { generateInviteToken, hashInviteToken } from '../infrastructure/auth/crypto.js'
import { InviteRepository } from '../modules/invites/invite.repository.js'
import { UserRepository } from '../modules/user/user.repository.js'

const logger = createModuleLogger('BOOTSTRAP')

export async function bootstrapFirstInvite() {
  const inviteRepository = new InviteRepository()
  const userRepository = new UserRepository()

  const userCount = await userRepository.countUsers()

  if (userCount > 0) {
    logger.info('Users already exist, skipping first-invite bootstrap.')
    return
  }

  const token = generateInviteToken()
  const tokenHash = hashInviteToken(token)

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await inviteRepository.createSystem({
    email: null,
    tokenHash,
    expiresAt
  })

  logger.info('First-user invite created:')
  logger.info(`  Register at: ${appConfig.appUrl}/register?token=${token}`)
}
