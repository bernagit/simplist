import { sections } from '../../db/schema/sections'
import db from '../../infrastructure/database/db'
import { eq, and } from 'drizzle-orm'

export class SectionRepository {
  async create(listId: string, title: string, order: number | undefined = undefined) {
    const newSection = {
      listId,
      title,
      order
    }

    const [section] = await db.insert(sections).values(newSection).returning()

    return section
  }

  async getById(sectionId: string) {
    const query = db.select().from(sections).where(eq(sections.id, sectionId))

    const result = await query.execute()
    return result[0]
  }

  async getByListId(listId: string) {
    const query = db.select().from(sections).where(eq(sections.listId, listId))

    const result = await query.execute()
    return result
  }

  async createDefault(listId: string) {
    return await this.create(listId, 'DEFAULT', 1)
  }

  async getDefaultSection(listId: string) {
    const query = db
      .select()
      .from(sections)
      .where(and(eq(sections.listId, listId), eq(sections.title, 'DEFAULT')))

    const result = await query.execute()
    return result[0]
  }
}
