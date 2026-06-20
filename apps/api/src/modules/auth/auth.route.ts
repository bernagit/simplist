import { Router } from 'express'

import { validate } from '../../infrastructure/middleware/validate'

import { AuthRepository } from './auth.repository'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

import { registerSchema, loginSchema, refreshSchema } from './auth.schema'

const router = Router()

const repository = new AuthRepository()
const service = new AuthService(repository)
const controller = new AuthController(service)

router.post('/register', validate(registerSchema), controller.register)

router.post('/login', validate(loginSchema), controller.login)

router.post('/logout', controller.logout)

router.post('/refresh', validate(refreshSchema), controller.refresh)

export default router
