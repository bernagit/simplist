import { Router } from 'express'
import { BaseController } from './base.controller.js'
import { requireAuth } from '../../infrastructure/middleware/auth.js'
import { validate } from '../../infrastructure/middleware/validate.js'
import { searchQuerySchema } from './base.schema.js'

const router = Router()

const controller = new BaseController()

router.use(requireAuth)

router.get('/search', validate(searchQuerySchema), controller.search)

export default router
