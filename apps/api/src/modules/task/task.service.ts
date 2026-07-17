import { ListMemberRole } from '../../db/schema/listMember.js'
import { Errors } from '../../types/http.js'
import { ListRepository } from '../list/list.repository.js'
import { SectionRepository } from '../section/section.repository.js'
import { TaskRepository } from './task.repository.js'
import { CreateTaskInput, UpdateTaskInput } from './task.schema.js'

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

    // get the last order in the section
    const lastOrder = await this.repository.getLastOrderInSection(sectionId)
    data.order = lastOrder + 1

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

    const completed = task.completed ? false : true
    await this.repository.update(taskId, { completed })
  }

  async reorder(
    movedTaskId: string,
    targetTaskId: string,
    listId: string,
    sectionId: string,
    userId: string
  ) {
    const members = await this.listRepository.getMembers(listId)
    if (!this.isMember(members, userId)) {
      throw Errors.forbidden('You do not have permission to reorder tasks in this list')
    }

    const movedTask = await this.repository.getById(movedTaskId)
    const targetTask = await this.repository.getById(targetTaskId)

    if (!movedTask || !targetTask) {
      throw Errors.notFound('One or both tasks not found')
    }

    if (movedTask.sectionId !== sectionId || targetTask.sectionId !== sectionId) {
      throw Errors.badRequest('Tasks must be in the same section to reorder')
    }

    await this.repository.reorder(
      movedTaskId,
      targetTaskId,
      movedTask.order,
      targetTask.order,
      sectionId
    )

    return await this.repository.getBySectionId(sectionId)
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
