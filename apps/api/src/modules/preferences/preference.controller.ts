import { Request, Response, NextFunction } from 'express'
import { createModuleLogger } from '../../infrastructure/logging/logger.js'
import { HTTP_STATUS } from '../../types/http.js'
import { UpdatePreferencesInput } from './preference.schema.js'
import { PreferenceService } from './preference.service.js'

export class PreferenceController {
  private readonly logger = createModuleLogger('PreferenceController')
  private readonly preferenceService: PreferenceService = new PreferenceService()

  constructor() {}

  getPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: 'Not authenticated'
        })
      }

      const preferences = await this.preferenceService.getPreferences(userId)

      res.status(HTTP_STATUS.OK).json({
        message: 'Preferences retrieved successfully',
        data: preferences
      })
    } catch (error) {
      next(error)
    }
  }

  updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id

      const data = req.validated!.body as UpdatePreferencesInput

      const updatedPreferences = await this.preferenceService.updatePreferences(userId, data)

      res.status(HTTP_STATUS.OK).json({
        message: 'Preferences updated successfully',
        data: updatedPreferences
      })
    } catch (error) {
      next(error)
    }
  }
}
