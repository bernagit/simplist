import { Router } from 'express'
import { validate } from '../../infrastructure/middleware/validate.js'
import { AuthController } from './auth.controller.js'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  passwordResetSchema,
  updateCurrentUserSchema,
  changePasswordSchema,
  refreshTokenSchema
} from './auth.schema.js'
import { requireAuth } from '../../infrastructure/middleware/auth.js'

const router = Router()

const controller = new AuthController()

router.get('/me', requireAuth, controller.getCurrentUser)
router.put('/me', requireAuth, validate(updateCurrentUserSchema), controller.updateCurrentUser)
router.post(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema),
  controller.changePassword
)
router.post('/register', validate(registerSchema), controller.register)
router.post('/login', validate(loginSchema), controller.login)
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword)
router.post('/reset-password', validate(passwordResetSchema), controller.resetPassword)
router.post('/logout', validate(refreshTokenSchema), controller.logout)
router.post('/refresh', validate(refreshTokenSchema), controller.refresh)

export default router
