import { ListMemberRole } from '../../db/schema/listMember'
import { Errors } from '../../types/http'
import { ListRepository } from '../list/list.repository'
import { SectionRepository } from '../section/section.repository'
import { TaskRepository } from './task.repository'
import { CreateTaskInput, UpdateTaskInput } from './task.schema'

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
}
