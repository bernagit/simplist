import { Errors } from '../../types/http'
import { SectionRepository } from '../section/section.repository'
import { TaskRepository } from '../task/task.repository'
import { UserRepository } from '../user/user.repository'
import { ListRepository } from './list.repository'
import { ListAddMemberInput, ListCreateInput, ListUpdateInput } from './list.schema'

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

    // add the owner as a member of the list
    await this.repository.addMember(list.id, ownerId, 'owner')

    return list
  }

  async getAll(userId: string) {
    const lists = await this.repository.getAll(userId)

    const sharedLists = await this.repository.getShared(userId)

    if (!lists || !sharedLists) {
      throw Errors.internal('Failed to retrieve lists')
    }

    return {
      owned: lists,
      shared: sharedLists
    }
  }

  async getById(listId: string, userId: string) {
    // Check if the user has permission to view the list
    const canView = await this.repository.canView(listId, userId)
    if (!canView) {
      throw Errors.forbidden('You do not have permission to view this list')
    }

    const list = await this.repository.getById(listId, userId)
    if (!list) {
      throw Errors.notFound('List not found')
    }
    // get members
    const members = await this.repository.getMembers(listId)
    // get sections
    const sections = await this.sectionRepository.getByListId(listId)
    // find the default section id
    const defaultSection = await this.sectionRepository.getDefaultSection(listId)
    const defaultSectionId = defaultSection ? defaultSection.id : null

    // get tasks
    const tasks = await this.taskRepository.getByListId(listId)

    return {
      ...list,
      defaultSectionId,
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

  async share(userId: string, listId: string, data: ListAddMemberInput) {
    const { shareWithEmail, role } = data

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

  async removeMember(listId: string, userId: string, memberId: string) {
    // Check if the user has permission to view the list
    const canUpdate = await this.repository.canUpdate(listId, userId)
    if (!canUpdate) {
      throw Errors.forbidden('You do not have permission to remove members from this list')
    }

    // Check if the member to be removed exists
    const members = await this.repository.getMembers(listId)
    const memberExists = members.some(member => member.id === memberId)

    if (!memberExists) {
      throw Errors.notFound('Member not found in this list')
    }

    // Prevent the owner from being removed
    const owner = members.find(member => member.role === 'owner')
    if (owner && owner.userId === memberId) {
      throw Errors.badRequest('You cannot remove the owner of the list')
    }

    return await this.repository.removeMember(listId, memberId)
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

  async unarchive(listId: string, userId: string) {
    // Check if the user has permission to view the list
    const canUpdate = await this.repository.canUpdate(listId, userId)
    if (!canUpdate) {
      throw Errors.forbidden('You do not have permission to unarchive this list')
    }

    const list = await this.repository.update(listId, { archivedAt: null })

    if (!list) {
      throw Errors.notFound('List not found')
    }

    return list
  }
}
