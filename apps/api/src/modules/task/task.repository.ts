import { format } from 'date-fns'
import { and, asc, desc, eq, gte, isNotNull, lte } from 'drizzle-orm'
import { LexoRank } from 'lexorank'
import { lists } from '../../db/schema/lists.js'
import { sections } from '../../db/schema/sections.js'
import { tasks } from '../../db/schema/tasks.js'
import db from '../../infrastructure/database/db.js'
import { CreateTaskInput, UpdateTaskInput } from './task.schema.js'

export class TaskRepository {
  constructor() {}

  async getById(taskId: string) {
    const query = db.select().from(tasks).where(eq(tasks.id, taskId))

    const [task] = await query.execute()
    return task
  }

  async getByListId(listId: string) {
    const query = db.select().from(tasks).where(eq(tasks.listId, listId)).orderBy(asc(tasks.order))

    const result = await query.execute()
    return result
  }

  async getBySectionId(sectionId: string) {
    const query = db
      .select()
      .from(tasks)
      .where(eq(tasks.sectionId, sectionId))
      .orderBy(asc(tasks.order))

    const result = await query.execute()
    return result
  }

  async create(creatorId: string, listId: string, sectionId: string, data: CreateTaskInput) {
    const lastRank = await this.getLastRankInSection(sectionId)
    const taskOrder = lastRank
      ? LexoRank.parse(lastRank).genNext().toString()
      : LexoRank.middle().toString()

    const newTask = {
      listId,
      sectionId,
      creatorId,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      durationMinutes: data.durationMinutes,
      recurrenceRule: data.recurrenceRule,
      order: taskOrder,
      priority: data.priority
    }

    const [task] = await db.insert(tasks).values(newTask).returning()

    return task
  }

  async getLastRankInList(listId: string): Promise<string | null> {
    const result = await db
      .select({ order: tasks.order })
      .from(tasks)
      .where(eq(tasks.listId, listId))
      .orderBy(desc(tasks.order))
      .limit(1)
      .execute()

    return result[0]?.order ?? null
  }

  async getLastRankInSection(sectionId: string): Promise<string | null> {
    const result = await db
      .select({ order: tasks.order })
      .from(tasks)
      .where(eq(tasks.sectionId, sectionId))
      .orderBy(desc(tasks.order))
      .limit(1)
      .execute()

    return result[0]?.order ?? null
  }

  async delete(taskId: string) {
    // With LexoRank strings, deleting a task is O(1) as no downstream items need shifting
    const query = db.delete(tasks).where(eq(tasks.id, taskId))
    await query.execute()
  }

  async update(taskId: string, data: Partial<UpdateTaskInput>) {
    const query = db.update(tasks).set(data).where(eq(tasks.id, taskId))

    const [task] = await query.returning().execute()
    return task
  }

  async reorder(taskId: string, targetSectionId: string, newOrder: string) {
    await db
      .update(tasks)
      .set({ sectionId: targetSectionId, order: newOrder })
      .where(eq(tasks.id, taskId))
  }

  async getPlannedTasks(
    startDate: Date,
    endDate: Date,
    userId: string,
    filters: { listId?: string | undefined }
  ) {
    const start = format(startDate, 'yyyy-MM-dd')
    const end = format(endDate, 'yyyy-MM-dd')

    const query = db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        dueDate: tasks.dueDate,
        dueTime: tasks.dueTime,
        durationMinutes: tasks.durationMinutes,
        recurrenceRule: tasks.recurrenceRule,
        completed: tasks.completed,
        priority: tasks.priority,
        order: tasks.order,
        listId: tasks.listId,
        sectionId: tasks.sectionId,
        color: lists.color,
        listTitle: lists.title,
        sectionTitle: sections.title
      })
      .from(tasks)
      .innerJoin(lists, eq(tasks.listId, lists.id))
      .leftJoin(sections, eq(tasks.sectionId, sections.id))
      .where(
        and(
          eq(lists.ownerId, userId),
          isNotNull(tasks.dueDate),
          gte(tasks.dueDate, start),
          lte(tasks.dueDate, end),
          filters.listId ? eq(tasks.listId, filters.listId) : undefined
        )
      )
      .orderBy(asc(tasks.dueDate), asc(tasks.order))

    const result = await query.execute()
    return result
  }
}
