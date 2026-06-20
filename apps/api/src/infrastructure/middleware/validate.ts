import { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'
import { HTTP_STATUS } from '../../types/http'

export function validate(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
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
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: 'Validation failed',
          errors: error.issues
        })
      }

      next(error)
    }
  }
}
