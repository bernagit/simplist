import { LexoRank } from 'lexorank'
import { ListMemberRole } from '../../db/schema/listMember.js'
import { Errors } from '../../types/http.js'
import { ListRepository } from '../list/list.repository.js'
import { SectionRepository } from '../section/section.repository.js'
import { getNextOccurrence } from './task.recurrence.js'
import { TaskRepository } from './task.repository.js'
import { CreateTaskInput, UpdateTaskInput } from './task.schema.js'

export type ReorderTaskType = {
  listId: string
  userId: string
  movedTaskId: string
  targetSectionId: string
  prevTaskId: string | undefined
  nextTaskId: string | undefined
}

export class TaskService {
  private readonly repository: TaskRepository = new TaskRepository()
  private readonly listRepository: ListRepository = new ListRepository()
  private readonly sectionRepository: SectionRepository = new SectionRepository()
  constructor() {}

  private readonly canEditRoles: ListMemberRole[] = ['owner', 'editor']

  // PRIVATE METHODS
  private isMember = (
    members: { userId: string | null; role: ListMemberRole }[],
    userId: string
  ) => {
    return members.some(
      member => member.userId === userId && this.canEditRoles.includes(member.role)
    )
  }

  // PUBLIC METHODS
  async create(data: CreateTaskInput, listId: string, sectionId: string, userId: string) {
    const members = await this.listRepository.getMembers(listId)

    if (!this.isMember(members, userId)) {
      throw Errors.forbidden('You do not have permission to create a task in this list')
    }

    // if (!sectionId) {
    //   // get the default section for the list
    //   const section = await this.sectionRepository.getDefaultSection(listId)
    //   if (!section) {
    //     throw Errors.internal('Default section not found for the list')
    //   }
    //   sectionId = section.id
    // }

    const task = await this.repository.create(userId, listId, sectionId, data)
    return task
  }

  async update(taskId: string, data: Partial<UpdateTaskInput>, userId: string) {
    const task = await this.repository.getById(taskId)
    if (!task) {
      throw Errors.notFound('Task not found')
    }

    const members = await this.listRepository.getMembers(task.listId)

    if (!this.isMember(members, userId)) {
      throw Errors.forbidden('You do not have permission to update this task')
    }

    const updatedTask = await this.repository.update(taskId, data)
    return updatedTask
  }

  async delete(taskId: string, userId: string) {
    const list = await this.listRepository.getByTaskId(taskId)
    if (!list) {
      throw Errors.notFound('Task not found')
    }
    const members = await this.listRepository.getMembers(list.listId)

    if (!this.isMember(members, userId)) {
      throw Errors.forbidden('You do not have permission to delete this task')
    }

    await this.repository.delete(taskId)
  }

  async toggleComplete(taskId: string, userId: string) {
    const list = await this.listRepository.getByTaskId(taskId)
    if (!list) {
      throw Errors.notFound('Task not found')
    }
    const members = await this.listRepository.getMembers(list.listId)

    if (!this.isMember(members, userId)) {
      throw Errors.forbidden('You do not have permission to update this task')
    }

    const task = await this.repository.getById(taskId)
    if (!task) {
      throw Errors.notFound('Task not found')
    }

    // Completing an open recurring task moves it to its next occurrence and keeps it open.
    // It is marked completed only when the series has ended.
    if (!task.completed && task.recurrenceRule && task.dueDate) {
      const next = getNextOccurrence(task.recurrenceRule, task.dueDate)
      if (next) {
        return this.repository.update(taskId, {
          dueDate: next.dueDate,
          recurrenceRule: next.recurrenceRule
        })
      }
    }

    return this.repository.update(taskId, { completed: !task.completed })
  }

  async reorder(params: ReorderTaskType) {
    const members = await this.listRepository.getMembers(params.listId)
    if (!this.isMember(members, params.userId)) {
      throw Errors.forbidden('You do not have permission to reorder tasks in this list')
    }

    const { movedTaskId, targetSectionId, prevTaskId, nextTaskId } = params

    // 1. Fetch adjacent tasks to get their current rank strings
    let prevRank: LexoRank | null = null
    let nextRank: LexoRank | null = null

    if (prevTaskId) {
      const prevTask = await this.repository.getById(prevTaskId)
      if (prevTask) prevRank = LexoRank.parse(prevTask.order)
    }

    if (nextTaskId) {
      const nextTask = await this.repository.getById(nextTaskId)
      if (nextTask) nextRank = LexoRank.parse(nextTask.order)
    }

    // 2. Calculate new midpoint rank string
    let newOrderStr: string

    if (prevRank && nextRank) {
      newOrderStr = prevRank.between(nextRank).toString()
    } else if (prevRank) {
      newOrderStr = prevRank.genNext().toString()
    } else if (nextRank) {
      newOrderStr = nextRank.genPrev().toString()
    } else {
      // Empty section
      newOrderStr = LexoRank.middle().toString()
    }

    // 3. Update ONLY the single moved task ($O(1)$ DB operation)
    await this.repository.reorder(movedTaskId, targetSectionId, newOrderStr)
  }

  async getPlannedTasks(
    startDate: Date,
    endDate: Date,
    userId: string,
    filters: {
      listId?: string | undefined
    }
  ) {
    const tasks = await this.repository.getPlannedTasks(startDate, endDate, userId, filters)
    return tasks
  }
}
