import { NextFunction, Request, Response } from 'express'
import { SearchQuery } from './base.schema.js'
import { BaseService } from './base.service.js'
import { HTTP_STATUS } from '../../types/http.js'

export class BaseController {
  private readonly service: BaseService = new BaseService()
  constructor() {}

  search = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const query = req.validated!.query as SearchQuery

    try {
      const result = await this.service.search(userId, query.q)

      res.status(HTTP_STATUS.OK).json({
        message: 'Search results retrieved successfully',
        data: result
      })
    } catch (error) {
      next(error)
    }
  }
}
