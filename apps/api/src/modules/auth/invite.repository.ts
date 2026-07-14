import { and, eq, gt } from 'drizzle-orm'
import { betaInvites } from '../../db/schema/betaInvites'
import { createModuleLogger } from '../../infrastructure/logging/logger'
import db from '../../infrastructure/database/db'

export class InviteRepository {
  private readonly logger = createModuleLogger('InviteRepository')

  async create(data: { email: string; token: string; invitedBy?: string; expiresAt: Date }) {
    const [invite] = await db.insert(betaInvites).values(data).returning()

    return invite
  }

  async findByEmail(email: string) {
    const [invite] = await db
      .select()
      .from(betaInvites)
      .where(eq(betaInvites.email, email))
      .limit(1)

    return invite ?? null
  }

  async findByToken(token: string) {
    const [invite] = await db
      .select()
      .from(betaInvites)
      .where(eq(betaInvites.token, token))
      .limit(1)

    return invite ?? null
  }

  async markAsUsed(id: string) {
    const [invite] = await db
      .update(betaInvites)
      .set({
        used: true
      })
      .where(eq(betaInvites.id, id))
      .returning()

    return invite ?? null
  }

  async isValidInvite(token: string) {
    const [invite] = await db
      .select()
      .from(betaInvites)
      .where(
        and(
          eq(betaInvites.token, token),
          eq(betaInvites.used, false),
          gt(betaInvites.expiresAt, new Date())
        )
      )
      .limit(1)

    return invite ?? null
  }

  async deleteByEmail(email: string) {
    const [deletedInvite] = await db
      .delete(betaInvites)
      .where(eq(betaInvites.email, email))
      .returning()

    return deletedInvite ?? null
  }
}
