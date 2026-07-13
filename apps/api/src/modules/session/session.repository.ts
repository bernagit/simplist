import { eq } from 'drizzle-orm'
import { sessions } from '../../db/schema/sessions'
import { createModuleLogger } from '../../infrastructure/logging/logger'
import db from '../../infrastructure/database/db'

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

  async delete(id: string) {
    await db.delete(sessions).where(eq(sessions.id, id))
  }

  async deleteByUser(userId: string) {
    await db.delete(sessions).where(eq(sessions.userId, userId))
  }
}
