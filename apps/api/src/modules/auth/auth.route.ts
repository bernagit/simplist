import { Router } from 'express'
import { validate } from '../../infrastructure/middleware/validate'
import { AuthController } from './auth.controller'
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  inviteSchema,
  checkInviteSchema,
  forgotPasswordSchema,
  passwordResetSchema
} from './auth.schema'
import { requireAuth } from '../../infrastructure/middleware/auth'

const router = Router()

const controller = new AuthController()

router.get('/me', requireAuth, controller.getCurrentUser)

router.post('/register', validate(registerSchema), controller.register)

router.post('/create-invite', validate(inviteSchema), controller.createInvite)

router.post('/check-invite', validate(checkInviteSchema), controller.checkInvite)

router.post('/login', validate(loginSchema), controller.login)

router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword)

router.post('/reset-password', validate(passwordResetSchema), controller.resetPassword)

router.post('/logout', controller.logout)

router.post('/refresh', validate(refreshSchema), controller.refresh)

export default router
