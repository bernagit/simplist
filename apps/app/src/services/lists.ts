import { Resp } from '@/models/base'
import { AllList, CompleteList, CreateListInput, List, UpdateListInput } from '@/models/lists'
import api from '@/utils/ky'

async function getLists(): Promise<Resp<AllList>> {
  return await api.get('lists').json()
}

async function getListById(listId: string): Promise<Resp<CompleteList>> {
  return await api.get(`lists/${listId}`).json()
}

async function createList(data: CreateListInput): Promise<Resp<List>> {
  console.log('Creating list with data:', data) // Debugging line
  return await api.post('lists', { json: data }).json()
}

async function updateList(data: UpdateListInput): Promise<Resp<List>> {
  return await api.put(`lists/${data.id}`, { json: data }).json()
}

export const listsService = {
  getLists,
  getListById,
  createList,
  updateList
}
