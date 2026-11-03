import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUS } from '../../types/http.js'
import {
  DeviceIdInput,
  SubscribeInput,
  TestNotificationInput,
  UnsubscribeInput,
  UpdateSettingsInput
} from './notification.schema.js'
import { NotificationService } from './notification.service.js'

const USER_AGENT_MAX_LENGTH = 512

export class NotificationController {
  private readonly service = new NotificationService()

  getConfig = (_req: Request, res: Response) => {
    res.status(HTTP_STATUS.OK).json({
      message: 'Notification config retrieved successfully',
      data: this.service.getConfig()
    })
  }

  subscribe = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const data = req.validated!.body as SubscribeInput
    const userAgent = req.get('user-agent')?.slice(0, USER_AGENT_MAX_LENGTH) ?? null

    try {
      const device = await this.service.subscribe(userId, data, userAgent)
      res.status(HTTP_STATUS.CREATED).json({ message: 'Device subscribed', data: device })
    } catch (error) {
      next(error)
    }
  }

  unsubscribe = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const { endpoint } = req.validated!.body as UnsubscribeInput

    try {
      await this.service.unsubscribe(userId, endpoint)
      res.status(HTTP_STATUS.OK).json({ message: 'Device unsubscribed' })
    } catch (error) {
      next(error)
    }
  }

  listDevices = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!

    try {
      const devices = await this.service.listDevices(userId)
      res.status(HTTP_STATUS.OK).json({ message: 'Devices retrieved successfully', data: devices })
    } catch (error) {
      next(error)
    }
  }

  removeDevice = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const { id } = req.validated!.params as DeviceIdInput

    try {
      await this.service.removeDevice(userId, id)
      res.status(HTTP_STATUS.OK).json({ message: 'Device removed' })
    } catch (error) {
      next(error)
    }
  }

  getSettings = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!

    try {
      const settings = await this.service.getSettings(userId)
      res
        .status(HTTP_STATUS.OK)
        .json({ message: 'Settings retrieved successfully', data: settings })
    } catch (error) {
      next(error)
    }
  }

  updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const data = req.validated!.body as UpdateSettingsInput

    try {
      const settings = await this.service.updateSettings(userId, data)
      res.status(HTTP_STATUS.OK).json({ message: 'Settings updated successfully', data: settings })
    } catch (error) {
      next(error)
    }
  }

  sendTest = async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user!
    const data = req.validated!.body as TestNotificationInput

    try {
      const report = await this.service.sendTest(userId, data)
      res.status(HTTP_STATUS.OK).json({ message: 'Test notification sent', data: report })
    } catch (error) {
      next(error)
    }
  }
}
