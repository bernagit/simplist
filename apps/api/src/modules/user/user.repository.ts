import { eq, sql } from 'drizzle-orm'
import db from '../../infrastructure/database/db.js'
import { users } from '../../db/schema/users.js'
import { createModuleLogger } from '../../infrastructure/logging/logger.js'
import { UpdateCurrentUserInput } from '../auth/auth.schema.js'

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

  async updatePassword(userId: string, passwordHash: string) {
    const [user] = await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning()

    if (!user) {
      this.logger.error(`Failed to update password hash for user with ID ${userId}`)
      throw new Error('Failed to update password hash')
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }

  async update(userId: string, data: UpdateCurrentUserInput) {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning()

    if (!user) {
      this.logger.error(`Failed to update user with ID ${userId}`)
      throw new Error('Failed to update user')
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }

  async countUsers(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users)
    return Number(result[0]?.count ?? 0)
  }
}
