import { Request, Response, NextFunction } from 'express'
import { createModuleLogger } from '../logging/logger'
import { Errors } from '../../types/http'
import { jwtService } from '../auth/jwt'
import { UserRepository } from '../../modules/user/user.repository'

const logger = createModuleLogger('AUTH-MIDDLEWARE')
const userRepository = new UserRepository()

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const cookieToken = req.cookies.accessToken
  const authHeader = req.headers.authorization
  let headersToken: string | undefined

  if (authHeader && authHeader.startsWith('Bearer ')) {
    headersToken = authHeader.split(' ')[1]
  }

  // Check if the user is authenticated (e.g., check for a valid session or JWT)
  if (!cookieToken && !headersToken) {
    logger.warn('Authentication failed: No valid authentication token found')
    throw Errors.unauthorized('Authentication required')
  }

  // call the jwtService to verify the token and extract user information
  const payload = jwtService.verifyToken(cookieToken || headersToken!) as { userId: string } | null

  if (!payload) {
    logger.warn('Authentication failed: Invalid token')
    throw Errors.unauthorized('Invalid authentication token')
  }

  const user = await userRepository.findById(payload.userId)

  if (!user) {
    logger.warn(`Authentication failed: User not found for ID ${payload.userId}`)
    throw Errors.unauthorized('User not found')
  }

  // Attach user information to the request object for downstream use
  req.user = {
    id: user.id,
    email: user.email,
    name: user.name
  }

  next()
}
