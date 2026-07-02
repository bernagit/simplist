import { ListMemberRole } from '../../db/schema/listMember'
import { Errors } from '../../types/http'
import { ListRepository } from '../list/list.repository'
import { SectionRepository } from '../section/section.repository'
import { UserRepository } from '../user/user.repository'
import { CreateSectionInput } from './section.schema'

export class SectionService {
  private readonly repository: SectionRepository = new SectionRepository()
  private readonly listRepository: ListRepository = new ListRepository()
  private readonly userRepository: UserRepository = new UserRepository()
  constructor() {}

  private readonly canEditRoles: ListMemberRole[] = ['owner', 'editor']

  async create(data: CreateSectionInput, userId: string) {
    // get the associated list and check if the user can create a section in it
    const members = await this.listRepository.getMembers(data.listId)

    const isMember = members.some(
      member => member.userId === userId && this.canEditRoles.includes(member.role)
    )

    if (!isMember) {
      throw Errors.forbidden('You do not have permission to create a section in this list')
    }

    // if no order is provided, get the last section and set the order to last order + 1
    if (data.order === undefined) {
      const lastSection = await this.repository.getLastOrderInList(data.listId)
      data.order = lastSection + 1
    } else {
      // move all sections with order >= data.order down by 1
      const sections = await this.repository.getByListId(data.listId)
      const sectionsToUpdate = sections.filter(
        section => section.order !== null && section.order >= data.order!
      )

      for (const section of sectionsToUpdate) {
        await this.repository.update(section.id, { order: (section.order ?? 0) + 1 })
      }
    }

    // create the section
    const section = await this.repository.create(data.listId, data.title, data.order)

    if (!section) {
      throw Errors.internal('Failed to create section')
    }

    return section
  }

  async delete(sectionId: string, userId: string) {
    // get the section and check if the user can delete it
    const section = await this.repository.getById(sectionId)

    if (!section) {
      throw Errors.notFound('Section not found')
    }

    const members = await this.listRepository.getMembers(section.listId)

    const isMember = members.some(
      member => member.userId === userId && this.canEditRoles.includes(member.role)
    )

    if (!isMember) {
      throw Errors.forbidden('You do not have permission to delete this section')
    }
  }
}
