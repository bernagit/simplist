import { and, eq, gt, sql } from 'drizzle-orm'
import { invites } from '../../db/schema/invites.js'
import { createModuleLogger } from '../../infrastructure/logging/logger.js'
import db from '../../infrastructure/database/db.js'

export class InviteRepository {
  private readonly logger = createModuleLogger('InviteRepository')

  async createSystem(data: { email: string | null; tokenHash: string; expiresAt: Date }) {
    const [invite] = await db
      .insert(invites)
      .values({
        createdBy: null,
        email: data.email,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt
      })
      .returning()

    return invite
  }

  async create(
    userId: string,
    data: {
      email: string | null
      tokenHash: string
      expiresAt: Date
    }
  ) {
    const [invite] = await db
      .insert(invites)
      .values({ ...data, createdBy: userId })
      .returning()

    return invite
  }

  async findByEmail(email: string) {
    const [invite] = await db.select().from(invites).where(eq(invites.email, email)).limit(1)

    return invite ?? null
  }

  async findByToken(tokenHash: string) {
    const [invite] = await db
      .select()
      .from(invites)
      .where(
        and(
          eq(invites.tokenHash, tokenHash),
          eq(invites.used, false),
          eq(invites.revoked, false),
          gt(invites.expiresAt, new Date())
        )
      )
      .limit(1)

    return invite ?? null
  }

  async markAsUsed(id: string, emailRegistered: string) {
    const [invite] = await db
      .update(invites)
      .set({
        used: true,
        email: emailRegistered
      })
      .where(eq(invites.id, id))
      .returning()

    return invite ?? null
  }

  async isValidInvite(tokenHash: string) {
    const [invite] = await db
      .select()
      .from(invites)
      .where(
        and(
          eq(invites.tokenHash, tokenHash),
          eq(invites.used, false),
          eq(invites.revoked, false),
          gt(invites.expiresAt, new Date())
        )
      )
      .limit(1)

    return invite ?? null
  }

  async deleteByEmail(email: string) {
    const [deletedInvite] = await db.delete(invites).where(eq(invites.email, email)).returning()

    return deletedInvite ?? null
  }

  async countByCreator(userId: string) {
    const [result] = await db
      .select({
        count: sql<number>`count(*)`
      })
      .from(invites)
      .where(and(eq(invites.createdBy, userId), eq(invites.revoked, false)))

    if (!result) {
      this.logger.error(`Failed to count invites for user ${userId}`)
      throw new Error('Failed to count invites')
    }
    return Number(result.count)
  }

  async revokeInvite(userId: string, inviteId: string) {
    const [invite] = await db
      .update(invites)
      .set({
        revoked: true
      })
      .where(and(eq(invites.id, inviteId), eq(invites.createdBy, userId), eq(invites.used, false)))
      .returning()

    return invite ?? null
  }

  async findByCreator(userId: string) {
    const invitesList = await db
      .select({
        id: invites.id,
        email: invites.email,
        used: invites.used,
        expiresAt: invites.expiresAt,
        createdAt: invites.createdAt
      })
      .from(invites)
      .where(
        and(
          eq(invites.createdBy, userId),
          eq(invites.revoked, false),
          gt(invites.expiresAt, new Date())
        )
      )
    return invitesList
  }
}
