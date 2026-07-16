import { tasks } from '../../db/schema/tasks'
import db from '../../infrastructure/database/db'
import { and, eq, gt, gte, lt, lte, max, ne, sql } from 'drizzle-orm'
import { CreateTaskInput, UpdateTaskInput } from './task.schema'
import { logger } from '../../infrastructure/logging/logger'
import { lists } from '../../db/schema/lists'

export class TaskRepository {
  constructor() {}

  async getById(taskId: string) {
    const query = db.select().from(tasks).where(eq(tasks.id, taskId))

    const [task] = await query.execute()
    return task
  }

  async getByListId(listId: string) {
    const query = db.select().from(tasks).where(eq(tasks.listId, listId))

    const result = await query.execute()
    return result
  }

  async getBySectionId(sectionId: string) {
    const query = db.select().from(tasks).where(eq(tasks.sectionId, sectionId))

    const result = await query.execute()
    return result
  }

  async create(creatorId: string, listId: string, sectionId: string, data: CreateTaskInput) {
    const newTask = {
      listId,
      sectionId,
      creatorId,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      order: data.order,
      priority: data.priority
    }
    const [task] = await db.insert(tasks).values(newTask).returning()

    return task
  }

  async getLastOrderInList(listId: string) {
    const query = db
      .select({ maxOrder: max(tasks.order) })
      .from(tasks)
      .where(eq(tasks.listId, listId))

    const result = await query.execute()
    return result[0]?.maxOrder ?? 0
  }

  async getLastOrderInSection(sectionId: string) {
    const query = db
      .select({ maxOrder: max(tasks.order) })
      .from(tasks)
      .where(eq(tasks.sectionId, sectionId))

    const result = await query.execute()
    return result[0]?.maxOrder ?? 0
  }

  async delete(taskId: string) {
    const query = db.delete(tasks).where(eq(tasks.id, taskId))

    await query.execute()
  }

  async update(taskId: string, data: Partial<UpdateTaskInput>) {
    const query = db.update(tasks).set(data).where(eq(tasks.id, taskId))

    const [task] = await query.returning().execute()
    return task
  }

  async reorder(
    movedTaskId: string,
    targetTaskId: string,
    movedOrder: number,
    targetOrder: number,
    sectionId: string
  ) {
    const isMovingDown = movedOrder < targetOrder
    logger.info(
      `Reordering task ${movedTaskId} to position of task ${targetTaskId} in section ${sectionId}. Moving down: ${isMovingDown}`
    )

    await db.transaction(async tx => {
      await tx
        .update(tasks)
        .set({
          order: sql`${tasks.order} ${isMovingDown ? sql`- 1` : sql`+ 1`}`
        })
        .where(
          and(
            eq(tasks.sectionId, sectionId),
            ne(tasks.id, movedTaskId),
            isMovingDown
              ? and(gt(tasks.order, movedOrder), lte(tasks.order, targetOrder))
              : and(lt(tasks.order, movedOrder), gte(tasks.order, targetOrder))
          )
        )

      await tx.update(tasks).set({ order: targetOrder }).where(eq(tasks.id, movedTaskId))
    })
  }

  async getPlannedTasks(
    startDate: Date,
    endDate: Date,
    userId: string,
    filters: { listId?: string | undefined }
  ) {
    // get all tasks that belongs to the user and have dueDate between startDate and endDate
    const query = db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        dueDate: tasks.dueDate,
        completed: tasks.completed,
        priority: tasks.priority,
        order: tasks.order,
        listId: tasks.listId,
        sectionId: tasks.sectionId,
        color: lists.color,
        listTitle: lists.title
      })
      .from(tasks)
      .innerJoin(lists, eq(tasks.listId, lists.id))
      .where(
        and(
          eq(lists.ownerId, userId),
          gte(tasks.dueDate, startDate),
          lte(tasks.dueDate, endDate),
          filters.listId ? eq(tasks.listId, filters.listId) : undefined
        )
      )
    const result = await query.execute()
    return result
  }
}
