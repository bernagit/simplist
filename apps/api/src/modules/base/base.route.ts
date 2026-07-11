import { Router } from 'express'
import { BaseController } from './base.controller'
import { requireAuth } from '../../infrastructure/middleware/auth'
import { validate } from '../../infrastructure/middleware/validate'
import { searchQuerySchema } from './base.schema'

const router = Router()

const controller = new BaseController()

router.use(requireAuth)

router.get('/search', validate(searchQuerySchema), controller.search)

export default router
