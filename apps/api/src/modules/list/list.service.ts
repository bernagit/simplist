import { Errors } from '../../types/http'
import { SectionRepository } from '../section/section.repository'
import { TaskRepository } from '../task/task.repository'
import { UserRepository } from '../user/user.repository'
import { ListRepository } from './list.repository'
import { ListCreateInput, ListShareInput, ListUpdateInput } from './list.schema'

export class ListService {
  private readonly repository: ListRepository = new ListRepository()
  private readonly sectionRepository: SectionRepository = new SectionRepository()
  private readonly userRepository: UserRepository = new UserRepository()
  private readonly taskRepository: TaskRepository = new TaskRepository()
  constructor() {}

  async create(data: ListCreateInput, ownerId: string) {
    const list = await this.repository.create(data, ownerId)

    if (!list) {
      throw Errors.internal('Failed to create list')
    }

    // create also the default section for the list
    await this.sectionRepository.createDefault(list.id)

    return list
  }

  async getAll(ownerId: string) {
    const lists = await this.repository.getWithFilter(ownerId, {
      archived: false
    })

    const sharedLists = await this.repository.getShared(ownerId)

    if (!lists || !sharedLists) {
      throw Errors.internal('Failed to retrieve lists')
    }

    return {
      owned: lists,
      shared: sharedLists
    }
  }

  async getById(listId: string, ownerId: string) {
    // Check if the user has permission to view the list
    const canView = await this.repository.canView(listId, ownerId)
    if (!canView) {
      throw Errors.forbidden('You do not have permission to view this list')
    }

    const list = await this.repository.getById(listId, ownerId)
    if (!list) {
      throw Errors.notFound('List not found')
    }
    // get members
    const members = await this.repository.getMembers(listId)
    // get sections
    const sections = await this.sectionRepository.getByListId(listId)
    // get tasks
    const tasks = await this.taskRepository.getByListId(listId)

    return {
      ...list,
      members,
      sections,
      tasks
    }
  }

  async update(listId: string, data: Partial<ListUpdateInput>, userId: string) {
    // Check if the user has permission to view the list
    const canUpdate = await this.repository.canUpdate(listId, userId)
    if (!canUpdate) {
      throw Errors.forbidden('You do not have permission to update this list')
    }

    const list = await this.repository.update(listId, data)
    return list
  }

  async delete(listId: string, userId: string) {
    // Check if the user has permission to view the list
    const canDelete = await this.repository.canDelete(listId, userId)
    if (!canDelete) {
      throw Errors.forbidden('You do not have permission to delete this list')
    }

    return await this.repository.delete(listId)
  }

  async share(userId: string, data: ListShareInput) {
    const { listId, shareWithEmail, role } = data

    // Check if the user has permission to view the list
    const canUpdate = await this.repository.canUpdate(listId, userId)
    if (!canUpdate) {
      throw Errors.forbidden('You do not have permission to share this list')
    }

    const userShare = await this.userRepository.findByEmail(shareWithEmail)
    if (!userShare) {
      throw Errors.notFound('User not found')
    }

    // Check if the user is trying to share the list with themselves
    if (userId === userShare.id) {
      throw Errors.badRequest('You cannot share a list with yourself')
    }

    return await this.repository.addMember(listId, userShare.id, role)
  }

  async archive(listId: string, userId: string) {
    // Check if the user has permission to view the list
    const canUpdate = await this.repository.canUpdate(listId, userId)
    if (!canUpdate) {
      throw Errors.forbidden('You do not have permission to archive this list')
    }

    const list = await this.repository.update(listId, { archivedAt: new Date() })

    if (!list) {
      throw Errors.notFound('List not found')
    }

    return list
  }
}
