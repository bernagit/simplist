import { eq, and, isNull, gt } from 'drizzle-orm'
import { passwordResetTokens } from '../../db/schema/passwordReset'
import db from '../../infrastructure/database/db'
import { createModuleLogger } from '../../infrastructure/logging/logger'

export class PasswordResetRepository {
  private readonly logger = createModuleLogger('PasswordResetRepository')

  async create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    const [passwordResetToken] = await db.insert(passwordResetTokens).values(data).returning()

    return passwordResetToken
  }

  async findActiveByUserId(userId: string) {
    const [token] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, userId),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1)

    return token ?? null
  }

  async findByTokenHash(tokenHash: string) {
    const [passwordResetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
      .limit(1)

    return passwordResetToken ?? null
  }

  async markAsUsed(id: string) {
    const [passwordResetToken] = await db
      .update(passwordResetTokens)
      .set({
        usedAt: new Date()
      })
      .where(eq(passwordResetTokens.id, id))
      .returning()

    return passwordResetToken ?? null
  }
}
