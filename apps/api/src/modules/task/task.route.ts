import { Router } from 'express'
import { validate } from '../../infrastructure/middleware/validate'
import { requireAuth } from '../../infrastructure/middleware/auth'
import { createTaskSchema, taskIdSchema } from './task.schema'
import { TaskController } from './task.controller'

const route = Router()
const controller = new TaskController()

route.use(requireAuth) // Ensure that the user is authenticated for all routes in this router

route.post('/:listId{/:sectionId}', validate(createTaskSchema), controller.create)
route.delete('/:id', validate(taskIdSchema), controller.delete)

export default route
