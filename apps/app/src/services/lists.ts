import { Resp } from '@/models/base'
import {
  AllList,
  CompleteList,
  CreateListInput,
  List,
  ShareListInput,
  UpdateListInput
} from '@/models/lists'
import api from '@/utils/ky'

async function getLists(): Promise<Resp<AllList>> {
  return await api.get('lists').json()
}

async function getListById(listId: string): Promise<Resp<CompleteList>> {
  return await api.get(`lists/${listId}`).json()
}

async function createList(data: CreateListInput): Promise<Resp<List>> {
  return await api.post('lists', { json: data }).json()
}

async function updateList(data: UpdateListInput): Promise<Resp<List>> {
  return await api.put(`lists/${data.id}`, { json: data }).json()
}

async function shareList(listId: string, data: ShareListInput): Promise<Resp<void>> {
  return await api.post(`lists/${listId}/share`, { json: data }).json()
}

async function deleteListMember(listId: string, memberId: string): Promise<Resp<void>> {
  return await api.delete(`lists/${listId}/share/`, { json: { memberId } }).json()
}

async function archiveList(listId: string): Promise<Resp<void>> {
  return await api.patch(`lists/${listId}/archive`).json()
}

async function unarchiveList(listId: string): Promise<Resp<void>> {
  return await api.patch(`lists/${listId}/unarchive`).json()
}

export const listsService = {
  getLists,
  getListById,
  createList,
  updateList,
  shareList,
  deleteListMember,
  archiveList,
  unarchiveList
}
