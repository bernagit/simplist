import { Router } from 'express'
import { validate } from '../../infrastructure/middleware/validate.js'
import { requireAuth } from '../../infrastructure/middleware/auth.js'
import {
  createTaskSchema,
  plannedTaskSchema,
  reorderTasksSchema,
  taskIdSchema,
  updateTaskSchema
} from './task.schema.js'
import { TaskController } from './task.controller.js'

const route = Router()
const controller = new TaskController()

route.use(requireAuth) // Ensure that the user is authenticated for all routes in this router

route.post('/planned', validate(plannedTaskSchema), controller.getPlannedTasks)
route.post('/:listId{/:sectionId}', validate(createTaskSchema), controller.create)
route.put('/:id', validate(updateTaskSchema), controller.update)
route.patch('/:id/toggle', validate(taskIdSchema), controller.toggleComplete)
route.delete('/:id', validate(taskIdSchema), controller.delete)
route.put('/:listId/:sectionId/reorder', validate(reorderTasksSchema), controller.reorder)

export default route
