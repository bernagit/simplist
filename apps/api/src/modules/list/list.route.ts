import { Router } from 'express'
import { validate } from '../../infrastructure/middleware/validate'
import {
  createListSchema,
  listIdSchema,
  addMemberSchema,
  updateListSchema,
  removeMemberSchema,
  changeMemberRoleSchema
} from './list.schema'
import { ListController } from './list.controller'
import { requireAuth } from '../../infrastructure/middleware/auth'

const route = Router()
const controller = new ListController()

route.use(requireAuth) // Ensure that the user is authenticated for all routes in this router

route.post('/', validate(createListSchema), controller.create)
route.get('/', controller.getAll)
route.get('/:id', validate(listIdSchema), controller.getById)
route.put('/:id', validate(updateListSchema), controller.update)
route.delete('/:id', validate(listIdSchema), controller.delete)
route.post('/:id/share', validate(addMemberSchema), controller.share)
route.delete('/:id/share', validate(removeMemberSchema), controller.removeMember)
route.patch('/:id/archive', validate(listIdSchema), controller.archive)
route.patch('/:id/unarchive', validate(listIdSchema), controller.unarchive)
route.patch('/:id/share/role', validate(changeMemberRoleSchema), controller.changeMemberRole)

export default route
