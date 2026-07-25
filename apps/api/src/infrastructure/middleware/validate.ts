import { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'
import { HTTP_STATUS } from '../../types/http.js'
import { createModuleLogger } from '../logging/logger.js'

const logger = createModuleLogger('VALIDATE-MIDDLEWARE')

export function validate(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.debug('Validating request', {
        body: req.body,
        params: req.params,
        query: req.query
      })
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      }) as {
        body?: unknown
        params?: unknown
        query?: unknown
      }

      req.validated = parsed

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation failed', { errors: error.issues })
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: 'Validation failed',
          errors: error.issues
        })
      }

      next(error)
    }
  }
}
