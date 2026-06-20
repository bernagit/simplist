import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { requestContext } from '../logging/requestContext'

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId = req.headers['x-correlation-id']?.toString() ?? crypto.randomUUID()

  res.setHeader('x-correlation-id', correlationId)

  requestContext.run({ correlationId }, () => next())
}
