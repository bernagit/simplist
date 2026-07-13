import { eq } from 'drizzle-orm'
import db from '../../infrastructure/database/db'
import { users } from '../../db/schema/users'
import { createModuleLogger } from '../../infrastructure/logging/logger'

export class UserRepository {
  private readonly logger = createModuleLogger('UserRepository')

  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email))
    return user
  }

  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id))
    return user
  }

  async createUser(data: { name: string; email: string; passwordHash: string }) {
    const [user] = await db.insert(users).values(data).returning()

    if (!user) {
      this.logger.error('Failed to create user')
      throw new Error('Failed to create user')
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }
}
