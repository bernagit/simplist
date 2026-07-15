import { Router } from 'express'
import { requireAuth } from '../../infrastructure/middleware/auth'
import { validate } from '../../infrastructure/middleware/validate'
import { updatePreferencesSchema } from './preference.schema'
import { PreferenceController } from './preference.controller'

const router = Router()

const controller = new PreferenceController()

router.get('/', requireAuth, controller.getPreferences)
router.put('/', requireAuth, validate(updatePreferencesSchema), controller.updatePreferences)

export default router
