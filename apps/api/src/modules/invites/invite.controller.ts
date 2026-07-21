import { Request, Response, NextFunction } from 'express'
import { createModuleLogger } from '../../infrastructure/logging/logger.js'
import { HTTP_STATUS } from '../../types/http.js'
import { InviteService } from './invite.service.js'
import { CheckInviteInput, InviteInput, RevokeInviteInput } from './invite.schema.js'

export class InviteController {
  private readonly logger = createModuleLogger('InviteController')
  private readonly inviteService = new InviteService()

  createInvite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const data = req.validated!.body as InviteInput

      const result = await this.inviteService.createInvite(userId, data)

      res.status(HTTP_STATUS.CREATED).json({
        message: 'Invite created successfully',
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  getInvites = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id

      const result = await this.inviteService.getInvites(userId)

      res.status(HTTP_STATUS.OK).json({
        message: 'Invites retrieved successfully',
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  checkInvite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.validated!.params as CheckInviteInput

      const result = await this.inviteService.checkInvite(data.token)

      res.status(HTTP_STATUS.OK).json({
        message: 'Invite is valid',
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  revokeInvite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const { id: inviteId } = req.validated!.params as RevokeInviteInput

      const result = await this.inviteService.revokeInvite(userId, inviteId)

      res.status(HTTP_STATUS.OK).json({
        message: 'Invite revoked successfully',
        data: result
      })
    } catch (error) {
      next(error)
    }
  }
}
