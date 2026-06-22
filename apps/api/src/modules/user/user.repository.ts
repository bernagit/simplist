import { eq } from 'drizzle-orm'
import db from '../../infrastructure/database/db'
import { users } from '../../db/schema/users'

export class UserRepository {
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

    return user
  }
}
