import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUS } from '../../types/http'
import { logger } from '../logging/logger'
import { AppError } from '../../types/error'
import appConfig from '../../config/env'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    const response: Record<string, unknown> = {
      message: err.message
    }

    // include details only if present
    if (err.details) {
      response.details = err.details
    }

    // stack trace ONLY in development
    if (appConfig.isDev && err.stack) {
      response.stack = err.stack
    }

    return res.status(err.statusCode).json(response)
  }

  logger.error(err)

  const response: Record<string, unknown> = {
    message: 'Internal Server Error'
  }

  if (appConfig.isDev && err instanceof Error && err.stack) {
    response.stack = err.stack
  }

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response)
}
