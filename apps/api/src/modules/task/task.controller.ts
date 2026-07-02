import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUS } from '../../types/http'
import { CreateTaskInput, CreateTaskParams, TaskIdInput } from './task.schema'
import { TaskService } from './task.service'

export class TaskController {
  private readonly service: TaskService = new TaskService()
  constructor() {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const data = req.validated!.body as CreateTaskInput
    const { listId, sectionId } = req.validated!.params as CreateTaskParams

    try {
      const task = await this.service.create(data, listId, sectionId, userId)

      res.status(HTTP_STATUS.CREATED).json({
        message: 'Task created successfully',
        data: task
      })
    } catch (error) {
      next(error)
    }
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const { id: taskId } = req.validated!.params as TaskIdInput

    try {
      await this.service.delete(taskId, userId)

      res.status(HTTP_STATUS.OK).json({
        message: 'Task deleted successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  toggleComplete = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const { id: taskId } = req.validated!.params as TaskIdInput

    try {
      await this.service.toggleComplete(taskId, userId)

      res.status(HTTP_STATUS.OK).json({
        message: 'Task completion toggled successfully'
      })
    } catch (error) {
      next(error)
    }
  }
}
