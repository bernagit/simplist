import { Router } from 'express'
import { requireAuth } from '../../infrastructure/middleware/auth.js'
import { validate } from '../../infrastructure/middleware/validate.js'
import { InviteController } from './invite.controller.js'
import { checkInviteSchema, inviteSchema, revokeInviteSchema } from './invite.schema.js'

const router = Router()

const controller = new InviteController()

router.post('/', requireAuth, validate(inviteSchema), controller.createInvite)
router.get('/', requireAuth, controller.getInvites)
router.patch('/:id/revoke', requireAuth, validate(revokeInviteSchema), controller.revokeInvite)

router.get('/:token/check', validate(checkInviteSchema), controller.checkInvite)

export default router
