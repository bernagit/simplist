import { Router } from 'express'
import { requireAuth } from '../../infrastructure/middleware/auth.js'
import { validate } from '../../infrastructure/middleware/validate.js'
import { updatePreferencesSchema } from './preference.schema.js'
import { PreferenceController } from './preference.controller.js'

const router = Router()

const controller = new PreferenceController()

router.get('/', requireAuth, controller.getPreferences)
router.put('/', requireAuth, validate(updatePreferencesSchema), controller.updatePreferences)

export default router
