import { LexoRank } from 'lexorank'
import { ListMemberRole } from '../../db/schema/listMember.js'
import { Errors } from '../../types/http.js'
import { ListRepository } from '../list/list.repository.js'
import { SectionRepository } from '../section/section.repository.js'
import { UserRepository } from '../user/user.repository.js'
import { CreateSectionInput, UpdateSectionInput } from './section.schema.js'

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

    // create the section
    const section = await this.repository.create(data.listId, data.title)

    if (!section) {
      throw Errors.internal('Failed to create section')
    }

    return section
  }

  async update(sectionId: string, data: Partial<UpdateSectionInput>, userId: string) {
    // get the section and check if the user can update it
    const section = await this.repository.getById(sectionId)

    if (!section) {
      throw Errors.notFound('Section not found')
    }

    const members = await this.listRepository.getMembers(section.listId)

    const isMember = members.some(
      member => member.userId === userId && this.canEditRoles.includes(member.role)
    )

    if (!isMember) {
      throw Errors.forbidden('You do not have permission to update this section')
    }

    // update the section
    const updatedSection = await this.repository.update(sectionId, data)

    if (!updatedSection) {
      throw Errors.internal('Failed to update section')
    }

    return updatedSection
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

    return await this.repository.delete(sectionId)
  }

  async reorder(
    listId: string,
    sectionId: string,
    prevSectionId: string | undefined,
    nextSectionId: string | undefined,
    userId: string
  ) {
    const section = await this.repository.getById(sectionId)
    if (!section) {
      throw Errors.notFound('Section not found')
    }

    const members = await this.listRepository.getMembers(listId)
    const isMember = members.some(
      member => member.userId === userId && this.canEditRoles.includes(member.role)
    )

    if (!isMember) {
      throw Errors.forbidden('You do not have permission to reorder this section')
    }

    // 1. Fetch surrounding sections to extract their LexoRank strings
    let prevRank: LexoRank | null = null
    let nextRank: LexoRank | null = null

    if (prevSectionId) {
      const prevSec = await this.repository.getById(prevSectionId)
      if (prevSec) prevRank = LexoRank.parse(prevSec.order)
    }

    if (nextSectionId) {
      const nextSec = await this.repository.getById(nextSectionId)
      if (nextSec) nextRank = LexoRank.parse(nextSec.order)
    }

    // 2. Compute new midpoint rank
    let newOrderStr: string

    if (prevRank && nextRank) {
      newOrderStr = prevRank.between(nextRank).toString()
    } else if (prevRank) {
      newOrderStr = prevRank.genNext().toString()
    } else if (nextRank) {
      newOrderStr = nextRank.genPrev().toString()
    } else {
      newOrderStr = LexoRank.middle().toString()
    }

    // 3. Persist single update
    await this.repository.reorder(sectionId, newOrderStr)
  }
}
