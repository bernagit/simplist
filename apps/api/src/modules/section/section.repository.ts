import { sections } from '../../db/schema/sections'
import db from '../../infrastructure/database/db'

export class SectionRepository {
  async create(listId: string, title: string, order: number) {
    const newSection = {
      listId,
      title,
      order
    }

    const [section] = await db.insert(sections).values(newSection).returning()

    return section
  }
}
