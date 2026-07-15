import { Resp } from '@/models/base'
import { UserPreferences } from '@/models/user'
import api from '@/utils/ky'

async function getPreferences() {
  return await api.get<Resp<UserPreferences>>('preferences').json()
}

async function updatePreferences(data: Partial<UserPreferences>) {
  return await api
    .put<Resp<UserPreferences>>('preferences', {
      json: data
    })
    .json()
}

export const preferencesService = {
  getPreferences,
  updatePreferences
}
