import { eq } from 'drizzle-orm'
import { userPreferences } from '../../db/schema/userPreferences'
import db from '../../infrastructure/database/db'
import { UpdatePreferencesInput } from './preference.schema'

export class PreferencesRepository {
  async findByUserId(userId: string) {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))

    return preferences ?? null
  }

  async createDefault(userId: string) {
    const [preferences] = await db
      .insert(userPreferences)
      .values({
        userId
      })
      .returning()

    return preferences
  }

  async create(userId: string) {
    const [preferences] = await db
      .insert(userPreferences)
      .values({
        userId
      })
      .returning()

    return preferences
  }

  async findOrCreate(userId: string) {
    const existing = await this.findByUserId(userId)

    if (existing) {
      return existing
    }

    return this.create(userId)
  }

  async update(userId: string, input: UpdatePreferencesInput) {
    const [preferences] = await db
      .update(userPreferences)
      .set({
        ...input,
        updatedAt: new Date()
      })
      .where(eq(userPreferences.userId, userId))
      .returning()

    return preferences
  }

  async upsert(userId: string, input: UpdatePreferencesInput) {
    const [preferences] = await db
      .insert(userPreferences)
      .values({
        userId,
        ...input
      })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          ...input,
          updatedAt: new Date()
        }
      })
      .returning()

    return preferences
  }

  async updateSettings(userId: string, settings: Record<string, unknown>) {
    const existing = await this.findOrCreate(userId)

    if (!existing) {
      throw new Error('User preferences not found')
    }

    const [preferences] = await db
      .update(userPreferences)
      .set({
        settings: {
          ...existing.settings,
          ...settings
        },
        updatedAt: new Date()
      })
      .where(eq(userPreferences.userId, userId))
      .returning()

    return preferences
  }

  async delete(userId: string) {
    await db.delete(userPreferences).where(eq(userPreferences.userId, userId))
  }
}
