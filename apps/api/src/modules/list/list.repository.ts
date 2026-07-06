import { eq, isNull, SQL, and, or, not } from 'drizzle-orm'
import { lists } from '../../db/schema/lists'
import db from '../../infrastructure/database/db'
import { ListCreateInput, ListUpdateInput } from './list.schema'
import { ListMemberRole, listMembers } from '../../db/schema/listMember'
import { tasks } from '../../db/schema/tasks'
import { users } from '../../db/schema/users'

export class ListRepository {
  constructor() {}

  // PRIVATE METHODS
  private notDeleted(): SQL {
    return isNull(lists.deletedAt)
  }

  private ownedBy(userId: string): SQL {
    return eq(lists.ownerId, userId)
  }

  // PUBLIC METHODS
  async create(data: ListCreateInput, ownerId: string) {
    const newList = {
      ...data,
      ownerId
    }
    const [list] = await db.insert(lists).values(newList).returning()
    if (!list) {
      return null
    }

    return list
  }

  async getWithFilter(
    ownerId: string,
    filter?: {
      archived?: boolean
    }
  ) {
    // base filters
    const filters: SQL[] = [this.notDeleted(), this.ownedBy(ownerId)]
    if (filter) {
      if (filter.archived !== undefined) {
        filters.push(isNull(lists.archivedAt))
      }
    }

    const query = db
      .select()
      .from(lists)
      .where(and(...filters))

    const result = await query.execute()
    return result
  }

  async getShared(userId: string) {
    const query = db
      .select()
      .from(lists)
      .innerJoin(listMembers, eq(lists.id, listMembers.listId))
      .where(
        and(eq(listMembers.userId, userId), this.notDeleted(), not(eq(listMembers.role, 'owner')))
      )
    const result = await query.execute()
    return result.map(r => r.lists)
  }

  async getById(listId: string, userId: string) {
    // get the list by id and check if the user is the owner or a member of the list
    // get also the list tasks and sections
    const query = db
      .select()
      .from(lists)
      .leftJoin(listMembers, eq(lists.id, listMembers.listId))
      .where(
        and(
          eq(lists.id, listId),
          or(this.ownedBy(userId), eq(listMembers.userId, userId)),
          this.notDeleted()
        )
      )

    const result = await query.execute()
    return result[0]?.lists || null
  }

  async getByTaskId(taskId: string) {
    const query = db
      .select({ listId: lists.id })
      .from(lists)
      .leftJoin(tasks, eq(lists.id, tasks.listId))
      .where(and(eq(tasks.id, taskId), this.notDeleted()))

    const result = await query.execute()
    return result[0] || null
  }

  async canView(listId: string, userId: string) {
    const query = db
      .select({ id: lists.id })
      .from(lists)
      .leftJoin(listMembers, eq(lists.id, listMembers.listId))
      .where(
        and(
          eq(lists.id, listId),
          or(this.ownedBy(userId), eq(listMembers.userId, userId)),
          this.notDeleted()
        )
      )

    const result = await query.execute()
    return result.length > 0
  }

  async canUpdate(listId: string, userId: string) {
    const query = db
      .select({ id: lists.id })
      .from(lists)
      .where(and(eq(lists.id, listId), this.ownedBy(userId), this.notDeleted()))

    const result = await query.execute()
    return result.length > 0
  }

  async canDelete(listId: string, userId: string) {
    const query = db
      .select({ id: lists.id })
      .from(lists)
      .where(and(eq(lists.id, listId), this.ownedBy(userId), this.notDeleted()))

    const result = await query.execute()
    return result.length > 0
  }

  async update(
    listId: string,
    data: Partial<ListUpdateInput & { archivedAt?: Date; favorite?: boolean }>
  ) {
    const [updatedList] = await db
      .update(lists)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(lists.id, listId))
      .returning()

    return updatedList
  }

  async delete(listId: string) {
    const [deletedList] = await db
      .update(lists)
      .set({ deletedAt: new Date() })
      .where(eq(lists.id, listId))
      .returning()

    return deletedList
  }

  async addMember(listId: string, shareWithUserId: string, role: ListMemberRole) {
    const newMember = {
      listId,
      userId: shareWithUserId,
      role
    }

    const [sharedList] = await db.insert(listMembers).values(newMember).returning()
    return sharedList
  }

  async removeMember(listId: string, listMemberId: string) {
    const [removedMember] = await db
      .delete(listMembers)
      .where(and(eq(listMembers.listId, listId), eq(listMembers.id, listMemberId)))
      .returning()

    return removedMember
  }

  async getMembers(listId: string) {
    const query = db
      .select({
        id: listMembers.id,
        role: listMembers.role,
        userId: users.id,
        email: users.email,
        name: users.name,
        joinedAt: listMembers.joinedAt
      })
      .from(listMembers)
      .leftJoin(users, eq(listMembers.userId, users.id))
      .where(eq(listMembers.listId, listId))

    const result = await query.execute()
    return result
  }
}
