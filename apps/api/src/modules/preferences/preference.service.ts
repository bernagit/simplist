import { createModuleLogger } from '../../infrastructure/logging/logger.js'
import { PreferencesRepository } from './preference.repository.js'
import { UpdatePreferencesInput } from './preference.schema.js'

export class PreferenceService {
  private readonly logger = createModuleLogger('PreferenceService')
  private readonly preferenceRepository = new PreferencesRepository()

  public async getPreferences(userId: string) {
    const preferences = await this.preferenceRepository.findByUserId(userId)

    if (!preferences) {
      throw new Error('Preferences not found')
    }

    return preferences
  }

  public async updatePreferences(userId: string, data: UpdatePreferencesInput) {
    const updatedPreferences = await this.preferenceRepository.update(userId, data)

    if (!updatedPreferences) {
      throw new Error('Failed to update preferences')
    }

    return updatedPreferences
  }
}
