import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUS } from '../../types/http'
import { SectionService } from './section.service'
import { CreateSectionInput, SectionIdInput } from './section.schema'

export class SectionController {
  private readonly service: SectionService = new SectionService()
  constructor() {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const data = req.validated!.body as CreateSectionInput

    try {
      const section = await this.service.create(data, userId)

      res.status(HTTP_STATUS.CREATED).json({
        message: 'Section created successfully',
        data: section
      })
    } catch (error) {
      next(error)
    }
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const { id: sectionId } = req.validated!.params as SectionIdInput

    try {
      await this.service.delete(sectionId, userId)

      res.status(HTTP_STATUS.OK).json({
        message: 'Section deleted successfully'
      })
    } catch (error) {
      next(error)
    }
  }
}
