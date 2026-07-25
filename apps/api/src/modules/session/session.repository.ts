import { eq } from 'drizzle-orm'
import { sessions } from '../../db/schema/sessions.js'
import { createModuleLogger } from '../../infrastructure/logging/logger.js'
import db from '../../infrastructure/database/db.js'

export class SessionRepository {
  private readonly logger = createModuleLogger('SessionRepository')

  async create(data: typeof sessions.$inferInsert) {
    const [session] = await db.insert(sessions).values(data).returning()

    if (!session) {
      this.logger.error('Failed to create session', { data })
      throw new Error('Failed to create session')
    }

    return session
  }

  async findById(id: string) {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1)

    return session ?? null
  }

  async findByRefreshTokenHash(refreshTokenHash: string) {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.refreshTokenHash, refreshTokenHash))
      .limit(1)

    return session ?? null
  }

  async touch(id: string) {
    await db.update(sessions).set({ lastUsedAt: new Date() }).where(eq(sessions.id, id))
  }

  async updateRefreshTokenHash(id: string, refreshTokenHash: string, expiresAt: Date) {
    await db.update(sessions).set({ refreshTokenHash, expiresAt }).where(eq(sessions.id, id))
  }

  async deleteById(id: string) {
    await db.delete(sessions).where(eq(sessions.id, id))
  }

  async deleteByUser(userId: string) {
    await db.delete(sessions).where(eq(sessions.userId, userId))
  }
}
