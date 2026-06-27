import { ListMemberRole } from '../../db/schema/listMember'
import { Errors } from '../../types/http'
import { ListRepository } from '../list/list.repository'
import { SectionRepository } from '../section/section.repository'
import { TaskRepository } from './task.repository'
import { CreateTaskInput } from './task.schema'

export class TaskService {
  private readonly repository: TaskRepository = new TaskRepository()
  private readonly listRepository: ListRepository = new ListRepository()
  private readonly sectionRepository: SectionRepository = new SectionRepository()
  constructor() {}

  private readonly canEditRoles: ListMemberRole[] = ['owner', 'editor']

  async create(
    data: CreateTaskInput,
    listId: string,
    sectionId: string | undefined,
    userId: string
  ) {
    const members = await this.listRepository.getMembers(listId)

    const isMember = members.some(
      member => member.userId === userId && this.canEditRoles.includes(member.role)
    )

    if (!isMember) {
      throw Errors.forbidden('You do not have permission to create a task in this list')
    }

    if (!sectionId) {
      // get the default section for the list
      const section = await this.sectionRepository.getDefaultSection(listId)
      if (!section) {
        throw Errors.internal('Default section not found for the list')
      }
      sectionId = section.id
    }

    const task = await this.repository.create(userId, listId, sectionId, data)
    return task
  }

  async delete(taskId: string, userId: string) {
    const members = await this.listRepository.getMembers(taskId)

    const isMember = members.some(
      member => member.userId === userId && this.canEditRoles.includes(member.role)
    )

    if (!isMember) {
      throw Errors.forbidden('You do not have permission to delete this task')
    }

    await this.repository.delete(taskId)
  }
}
