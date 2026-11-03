import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUS } from '../../types/http.js'
import {
  CreateTaskInput,
  CreateTaskParams,
  PlannedTaskInput,
  ReorderTasksInput,
  ReorderTasksParams,
  TaskIdInput,
  UpdateTaskInput
} from './task.schema.js'
import { ReorderTaskType, TaskService } from './task.service.js'

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

  update = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const { id: taskId } = req.validated!.params as TaskIdInput
    const data = req.validated!.body as UpdateTaskInput

    try {
      const updatedTask = await this.service.update(taskId, data, userId)

      res.status(HTTP_STATUS.OK).json({
        message: 'Task updated successfully',
        data: updatedTask
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
      const task = await this.service.toggleComplete(taskId, userId)

      res.status(HTTP_STATUS.OK).json({
        message: 'Task completion toggled successfully',
        data: task
      })
    } catch (error) {
      next(error)
    }
  }

  reorder = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const { listId } = req.validated!.params as ReorderTasksParams
    const { movedTaskId, prevTaskId, nextTaskId, targetSectionId } = req.validated!
      .body as ReorderTasksInput

    try {
      const params: ReorderTaskType = {
        listId,
        userId,
        movedTaskId,
        targetSectionId,
        prevTaskId,
        nextTaskId
      }
      const result = await this.service.reorder(params)

      res.status(HTTP_STATUS.OK).json({
        message: 'Tasks reordered successfully',
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  getPlannedTasks = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const { startDate, endDate, listId } = req.validated!.body as PlannedTaskInput

    const filters = {
      listId: listId || undefined
    }

    try {
      const tasks = await this.service.getPlannedTasks(startDate, endDate, userId, filters)

      res.status(HTTP_STATUS.OK).json({
        message: 'Planned tasks retrieved successfully',
        data: tasks
      })
    } catch (error) {
      next(error)
    }
  }
}
