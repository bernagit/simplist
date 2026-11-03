import { format } from 'date-fns'
import { and, asc, desc, eq, gte, ilike, isNotNull, isNull, lte, or, sql } from 'drizzle-orm'
import { LexoRank } from 'lexorank'
import { listMembers } from '../../db/schema/listMember.js'
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
      priority: data.priority,
      reminderEnabled: data.reminderEnabled,
      reminderLeadMinutes: data.reminderLeadMinutes,
      reminderTime: data.reminderTime
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
        reminderEnabled: tasks.reminderEnabled,
        reminderLeadMinutes: tasks.reminderLeadMinutes,
        reminderTime: tasks.reminderTime,
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
          lte(tasks.dueDate, end),
          // A recurring series that started before the range still has occurrences in it:
          // the app expands the rule from dueDate. Completed ones are ended series.
          or(
            gte(tasks.dueDate, start),
            and(isNotNull(tasks.recurrenceRule), eq(tasks.completed, false))
          ),
          filters.listId ? eq(tasks.listId, filters.listId) : undefined
        )
      )
      .orderBy(asc(tasks.dueDate), asc(tasks.order))

    const result = await query.execute()
    return result
  }

  /**
   * Tasks whose title or description contains `query`, in the lists the user owns or is a
   * member of (not deleted). Open tasks first, then by due date.
   */
  async search(userId: string, query: string, limit: number) {
    // Treat % and _ typed by the user as plain characters
    const pattern = `%${query.replace(/[\\%_]/g, char => `\\${char}`)}%`

    const result = await db
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
        reminderEnabled: tasks.reminderEnabled,
        reminderLeadMinutes: tasks.reminderLeadMinutes,
        reminderTime: tasks.reminderTime,
        order: tasks.order,
        listId: tasks.listId,
        sectionId: tasks.sectionId,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        color: lists.color,
        listTitle: lists.title,
        sectionTitle: sections.title,
        shared: sql<boolean>`${lists.ownerId} <> ${userId}`,
        role: listMembers.role
      })
      .from(tasks)
      .innerJoin(lists, eq(tasks.listId, lists.id))
      .innerJoin(listMembers, and(eq(listMembers.listId, lists.id), eq(listMembers.userId, userId)))
      .leftJoin(sections, eq(tasks.sectionId, sections.id))
      .where(
        and(
          isNull(lists.deletedAt),
          or(ilike(tasks.title, pattern), ilike(tasks.description, pattern))
        )
      )
      .orderBy(asc(tasks.completed), sql`${tasks.dueDate} asc nulls last`, asc(tasks.title))
      .limit(limit)
      .execute()

    return result
  }
}
