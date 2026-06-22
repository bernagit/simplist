import { AppError } from './error'

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const

export const Errors = {
  badRequest: (msg: string, details?: unknown) =>
    new AppError(msg, HTTP_STATUS.BAD_REQUEST, details),

  unauthorized: (msg = 'Unauthorized') => new AppError(msg, HTTP_STATUS.UNAUTHORIZED),

  forbidden: (msg = 'Forbidden') => new AppError(msg, HTTP_STATUS.FORBIDDEN),

  notFound: (msg = 'Not found') => new AppError(msg, HTTP_STATUS.NOT_FOUND),

  conflict: (msg = 'Conflict') => new AppError(msg, HTTP_STATUS.CONFLICT),

  internal: (msg = 'Internal server error', details?: unknown) =>
    new AppError(msg, HTTP_STATUS.INTERNAL_SERVER_ERROR, details)
}
