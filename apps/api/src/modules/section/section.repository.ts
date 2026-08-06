import { eq, and, asc, desc, ilike } from 'drizzle-orm'
import { LexoRank } from 'lexorank'
import { lists } from '../../db/schema/lists.js'
import { sections } from '../../db/schema/sections.js'
import db from '../../infrastructure/database/db.js'

export class SectionRepository {
  async create(listId: string, title: string) {
    const lastRank = await this.getLastRankInList(listId)
    const orderRank = lastRank
      ? LexoRank.parse(lastRank).genNext().toString()
      : LexoRank.middle().toString()

    const newSection = {
      listId,
      title,
      order: orderRank
    }

    const [section] = await db.insert(sections).values(newSection).returning()

    return section
  }

  async update(sectionId: string, data: Partial<{ title: string; order?: string }>) {
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
    // LexoRank strings sort lexicographically using ascending order
    const query = db
      .select()
      .from(sections)
      .where(eq(sections.listId, listId))
      .orderBy(asc(sections.order))

    const result = await query.execute()
    return result
  }

  async createDefault(listId: string) {
    return await this.create(listId, 'DEFAULT')
  }

  async getDefaultSection(listId: string) {
    const query = db
      .select()
      .from(sections)
      .where(and(eq(sections.listId, listId), eq(sections.title, 'DEFAULT')))

    const result = await query.execute()
    return result[0]
  }

  async getLastRankInList(listId: string): Promise<string | null> {
    const result = await db
      .select({ order: sections.order })
      .from(sections)
      .where(eq(sections.listId, listId))
      .orderBy(desc(sections.order))
      .limit(1)
      .execute()

    return result[0]?.order ?? null
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

  async reorder(sectionId: string, newOrder: string) {
    await db.update(sections).set({ order: newOrder }).where(eq(sections.id, sectionId))
  }
}
