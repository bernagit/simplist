import { Router } from 'express'
import { validate } from '../../infrastructure/middleware/validate'
import { requireAuth } from '../../infrastructure/middleware/auth'
import { createTaskSchema, taskIdSchema, updateTaskSchema } from './task.schema'
import { TaskController } from './task.controller'

const route = Router()
const controller = new TaskController()

route.use(requireAuth) // Ensure that the user is authenticated for all routes in this router

route.post('/:listId{/:sectionId}', validate(createTaskSchema), controller.create)
route.put('/:id', validate(updateTaskSchema), controller.update)
route.patch('/:id/toggle', validate(taskIdSchema), controller.toggleComplete)
route.delete('/:id', validate(taskIdSchema), controller.delete)

export default route
