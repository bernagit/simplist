import { eq, and, max, ilike } from 'drizzle-orm'
import { lists } from '../../db/schema/lists.js'
import { sections } from '../../db/schema/sections.js'
import db from '../../infrastructure/database/db.js'

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

  async update(sectionId: string, data: Partial<{ title: string; order: number | undefined }>) {
    const query = db.update(sections).set(data).where(eq(sections.id, sectionId))

    const [section] = await query.returning().execute()
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
    return await this.create(listId, 'DEFAULT', 0)
  }

  async getDefaultSection(listId: string) {
    const query = db
      .select()
      .from(sections)
      .where(and(eq(sections.listId, listId), eq(sections.title, 'DEFAULT')))

    const result = await query.execute()
    return result[0]
  }

  async getLastOrderInList(listId: string) {
    const query = db
      .select({ maxOrder: max(sections.order) })
      .from(sections)
      .where(eq(sections.listId, listId))

    const result = await query.execute()
    return result[0]?.maxOrder ?? 0
  }

  async search(userId: string, query: string) {
    const res = await db
      .select({
        id: sections.id,
        listId: sections.listId,
        title: sections.title,
        listName: lists.title
      })
      .from(sections)
      .innerJoin(lists, eq(sections.listId, lists.id))
      .where(and(eq(lists.ownerId, userId), ilike(sections.title, `%${query}%`)))
      .execute()

    return res
  }

  async delete(sectionId: string) {
    const query = db.delete(sections).where(eq(sections.id, sectionId))

    await query.execute()
  }
}
