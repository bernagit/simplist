import { Router } from 'express'
import { validate } from '../../infrastructure/middleware/validate'
import { requireAuth } from '../../infrastructure/middleware/auth'
import { SectionController } from './section.controller'
import { createSectionSchema, sectionIdSchema, updateSectionSchema } from './section.schema'

const route = Router()
const controller = new SectionController()

route.use(requireAuth) // Ensure that the user is authenticated for all routes in this router

route.post('/', validate(createSectionSchema), controller.create)
route.put('/:id', validate(updateSectionSchema), controller.update)
route.delete('/:id', validate(sectionIdSchema), controller.delete)

export default route
