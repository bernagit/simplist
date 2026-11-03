import { Router } from 'express'
import { requireAuth } from '../../infrastructure/middleware/auth.js'
import { validate } from '../../infrastructure/middleware/validate.js'
import { NotificationController } from './notification.controller.js'
import {
  deviceIdSchema,
  subscribeSchema,
  testNotificationSchema,
  unsubscribeSchema,
  updateSettingsSchema
} from './notification.schema.js'

const router = Router()
const controller = new NotificationController()

router.use(requireAuth)

router.get('/config', controller.getConfig)

router.get('/settings', controller.getSettings)
router.put('/settings', validate(updateSettingsSchema), controller.updateSettings)

// A device is a push subscription; it is identified by its endpoint from the browser
router.get('/devices', controller.listDevices)
router.post('/devices', validate(subscribeSchema), controller.subscribe)
router.post('/devices/unsubscribe', validate(unsubscribeSchema), controller.unsubscribe)
router.delete('/devices/:id', validate(deviceIdSchema), controller.removeDevice)

router.post('/test', validate(testNotificationSchema), controller.sendTest)

export default router
