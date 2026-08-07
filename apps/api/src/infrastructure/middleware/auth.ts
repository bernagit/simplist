import { Request, Response, NextFunction } from 'express'
import { createModuleLogger } from '../logging/logger.js'
import { Errors } from '../../types/http.js'
import { jwtService } from '../auth/jwt.js'
import { UserRepository } from '../../modules/user/user.repository.js'
import jwt from 'jsonwebtoken'

const logger = createModuleLogger('AUTH-MIDDLEWARE')
const userRepository = new UserRepository()

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    logger.warn('Authentication failed: Missing Authorization header')
    throw Errors.unauthorized('Authentication required')
  }

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const token = authHeader.slice(7)

  let payload: { userId: string }

  try {
    payload = jwtService.verifyToken(token) as { userId: string }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Authentication failed: Token expired')
      throw Errors.unauthorized('Token expired')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Authentication failed: Invalid token')
      throw Errors.unauthorized('Invalid authentication token')
    }
    throw error // genuinely unexpected — let it 500
  }

  const user = await userRepository.findById(payload.userId)

  if (!user) {
    logger.warn(`Authentication failed: User ${payload.userId} not found`)
    throw Errors.unauthorized('User not found')
  }

  // Attach user information to the request object for downstream use
  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar
  }

  next()
}
