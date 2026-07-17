import morgan from 'morgan'
import { logger } from '../logging/logger.js'
import { requestContext } from '../logging/requestContext.js'

morgan.token('correlation-id', () => {
  return requestContext.getStore()?.correlationId ?? '-'
})

export const morganMiddleware = morgan(':method :url :status :response-time ms', {
  stream: {
    write: (message: string) => {
      logger.http(message.trim())
    }
  }
})
