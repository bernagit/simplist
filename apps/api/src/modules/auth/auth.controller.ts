import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUS } from '../../types/http'
import { AuthService } from './auth.service'
import { LoginInput, RegisterInput } from './auth.schema'
import appConfig from '../../config/env'
import { cfg } from '../../config/internal'
import { createModuleLogger } from '../../infrastructure/logging/logger'

export class AuthController {
  private readonly logger = createModuleLogger('AuthController')
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.validated!.body as RegisterInput

      const user = await this.authService.register(data)

      res.status(HTTP_STATUS.CREATED).json({
        message: 'User created successfully',
        data: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      })
    } catch (error) {
      next(error)
    }
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.logger.info('Login request received', { body: req.validated!.body })
      const data = req.validated!.body as LoginInput

      const tokens = await this.authService.login(data)

      // set cookie
      res.cookie(cfg.AUTH_COOKIE_NAME, tokens.accessToken, {
        httpOnly: true,
        secure: !appConfig.isDev,
        sameSite: 'strict',
        maxAge: cfg.COOKIE_MAX_AGE
      })

      res.status(HTTP_STATUS.OK).json({
        message: 'Login successful',
        data: tokens
      })
    } catch (error) {
      next(error)
    }
  }

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie(cfg.AUTH_COOKIE_NAME, {
        httpOnly: true,
        secure: !appConfig.isDev,
        sameSite: 'strict'
      })

      res.status(HTTP_STATUS.OK).json({
        message: 'Logout successful'
      })
    } catch (error) {
      next(error)
    }
  }

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        message: 'Not implemented'
      })
    } catch (error) {
      next(error)
    }
  }
}
