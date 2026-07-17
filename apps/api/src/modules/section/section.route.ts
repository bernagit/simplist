import { Router } from 'express'
import { validate } from '../../infrastructure/middleware/validate.js'
import { requireAuth } from '../../infrastructure/middleware/auth.js'
import { SectionController } from './section.controller.js'
import { createSectionSchema, sectionIdSchema, updateSectionSchema } from './section.schema.js'

const route = Router()
const controller = new SectionController()

route.use(requireAuth) // Ensure that the user is authenticated for all routes in this router

route.post('/', validate(createSectionSchema), controller.create)
route.put('/:id', validate(updateSectionSchema), controller.update)
route.delete('/:id', validate(sectionIdSchema), controller.delete)

export default route
