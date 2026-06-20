import morgan from 'morgan'
import { logger } from '../logging/logger'
import { requestContext } from '../logging/requestContext'

morgan.token('correlation-id', () => {
  return requestContext.getStore()?.correlationId ?? '-'
})

export const morganMiddleware = morgan(':correlation-id :method :url :status :response-time ms', {
  stream: {
    write: (message: string) => {
      logger.http(message.trim())
    }
  }
})
