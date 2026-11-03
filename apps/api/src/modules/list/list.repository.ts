import { eq, isNull, SQL, and, or, not, ilike, exists, getTableColumns, sql } from 'drizzle-orm'
import { lists } from '../../db/schema/lists.js'
import db from '../../infrastructure/database/db.js'
import { ListCreateInput, ListUpdateInput } from './list.schema.js'
import { ListMemberRole, listMembers } from '../../db/schema/listMember.js'
import { tasks } from '../../db/schema/tasks.js'
import { users } from '../../db/schema/users.js'

export class ListRepository {
  constructor() {}

  // PRIVATE METHODS
  private notDeleted(): SQL {
    return isNull(lists.deletedAt)
  }

  private notArchived(): SQL {
    return isNull(lists.archivedAt)
  }

  private ownedBy(userId: string): SQL {
    return eq(lists.ownerId, userId)
  }

  /**
   * Task counts for the list overview (all sections; one indexed subquery each, by list_id).
   * References are explicit: in a query without joins drizzle renders `${column}` without its
   * table, and inside the subquery "id" would then be the task's id, not the list's.
   */
  private taskCounts() {
    const listId = sql`${lists}.${sql.identifier(lists.id.name)}`
    return {
      totalTasks:
        sql<number>`(select count(*) from ${tasks} as t where t.list_id = ${listId})`.mapWith(
          Number
        ),
      openTasks:
        sql<number>`(select count(*) from ${tasks} as t where t.list_id = ${listId} and not t.completed)`.mapWith(
          Number
        )
    }
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

  async getAll(ownerId: string) {
    // base filters
    const filters: SQL[] = [this.notDeleted(), this.ownedBy(ownerId)]

    const query = db
      .select({
        ...getTableColumns(lists),
        ...this.taskCounts(),
        shared: exists(
          db
            .select({ id: listMembers.id })
            .from(listMembers)
            .where(
              and(
                eq(listMembers.listId, lists.id),
                not(eq(listMembers.userId, ownerId)),
                not(eq(listMembers.role, 'owner'))
              )
            )
        )
      })
      .from(lists)
      .where(and(...filters))

    const result = await query.execute()
    return result
  }

  async getShared(userId: string) {
    const query = db
      .select({
        ...getTableColumns(lists),
        ...this.taskCounts(),
        owner: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar
        }
      })
      .from(lists)
      .innerJoin(listMembers, eq(lists.id, listMembers.listId))
      .innerJoin(users, eq(lists.ownerId, users.id))
      .where(
        and(
          eq(listMembers.userId, userId),
          this.notDeleted(),
          this.notArchived(),
          not(eq(listMembers.role, 'owner'))
        )
      )
    const result = await query.execute()
    return result
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
    data: Partial<ListUpdateInput & { archivedAt?: Date | null; favorite?: boolean }>
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

  async changeMemberRole(listId: string, memberId: string, role: 'editor' | 'viewer') {
    const [updatedMember] = await db
      .update(listMembers)
      .set({ role })
      .where(and(eq(listMembers.listId, listId), eq(listMembers.id, memberId)))
      .returning()

    return updatedMember
  }

  async getMembers(listId: string) {
    const query = db
      .select({
        id: listMembers.id,
        role: listMembers.role,
        userId: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
        joinedAt: listMembers.joinedAt
      })
      .from(listMembers)
      .leftJoin(users, eq(listMembers.userId, users.id))
      .where(eq(listMembers.listId, listId))

    const result = await query.execute()
    return result
  }

  async search(userId: string, query: string) {
    const res = await db
      .select({
        id: lists.id,
        title: lists.title,
        description: lists.description,
        color: lists.color,
        icon: lists.icon
      })
      .from(lists)
      .where(
        and(
          this.notDeleted(),
          this.ownedBy(userId),
          or(ilike(lists.title, `%${query}%`), ilike(lists.description, `%${query}%`))
        )
      )
      .execute()

    return res
  }
}
