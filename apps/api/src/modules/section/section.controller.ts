import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUS } from '../../types/http.js'
import { SectionService } from './section.service.js'
import {
  CreateSectionInput,
  ReorderSectionInput,
  SectionIdInput,
  UpdateSectionInput
} from './section.schema.js'

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

  update = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const { id: sectionId } = req.validated!.params as SectionIdInput
    const data = req.validated!.body as UpdateSectionInput

    try {
      const updatedSection = await this.service.update(sectionId, data, userId)

      res.status(HTTP_STATUS.OK).json({
        message: 'Section updated successfully',
        data: updatedSection
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

  reorder = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const { id: sectionId } = req.validated!.params as SectionIdInput
    const { listId, prevSectionId, nextSectionId } = req.validated!.body as ReorderSectionInput

    try {
      const result = await this.service.reorder(
        listId,
        sectionId,
        prevSectionId,
        nextSectionId,
        userId
      )

      res.status(HTTP_STATUS.OK).json({
        message: 'Section reordered successfully',
        data: result
      })
    } catch (error) {
      next(error)
    }
  }
}
