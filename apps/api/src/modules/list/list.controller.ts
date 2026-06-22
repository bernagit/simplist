import { NextFunction, Request, Response } from 'express'
import { ListService } from './list.service'
import { ListCreateInput, ListIdInput, ListShareInput, ListUpdateInput } from './list.schema'
import { HTTP_STATUS } from '../../types/http'

export class ListController {
  private readonly service: ListService = new ListService()
  constructor() {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const data = req.validated!.body as ListCreateInput

    try {
      const list = await this.service.create(data, userId)

      res.status(HTTP_STATUS.CREATED).json({
        message: 'List created successfully',
        data: list
      })
    } catch (error) {
      next(error)
    }
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!

    try {
      const lists = await this.service.getAll(userId)

      res.status(HTTP_STATUS.OK).json({
        message: 'Lists retrieved successfully',
        data: lists
      })
    } catch (error) {
      next(error)
    }
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const params = req.validated!.params as ListIdInput

    try {
      const list = await this.service.getById(params.id, userId)

      if (!list) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          message: 'List not found'
        })
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'List retrieved successfully',
        data: list
      })
    } catch (error) {
      next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const params = req.validated!.params as ListIdInput
    const data = req.validated!.body as Partial<ListUpdateInput>

    try {
      const updatedList = await this.service.update(params.id, data, userId)

      if (!updatedList) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          message: 'List not found'
        })
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'List updated successfully',
        data: updatedList
      })
    } catch (error) {
      next(error)
    }
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const params = req.validated!.params as ListIdInput

    try {
      const deleted = await this.service.delete(params.id, userId)

      if (!deleted) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          message: 'List not found'
        })
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'List deleted successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  share = async (req: Request, res: Response, next: NextFunction) => {
    const body = req.validated!.body as ListShareInput
    const { id: userId } = req.user!

    try {
      await this.service.share(userId, body)

      res.status(HTTP_STATUS.OK).json({
        message: 'List shared successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  archive = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const params = req.validated!.params as ListIdInput

    try {
      const updatedList = await this.service.archive(params.id, userId)

      if (!updatedList) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          message: 'List not found'
        })
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'List archived successfully',
        data: updatedList
      })
    } catch (error) {
      next(error)
    }
  }
}
