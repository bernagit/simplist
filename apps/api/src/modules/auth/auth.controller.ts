import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUS } from '../../types/http.js'
import { AuthService } from './auth.service.js'
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  PasswordResetInput,
  RegisterInput,
  UpdateCurrentUserInput
} from './auth.schema.js'
import { createModuleLogger } from '../../infrastructure/logging/logger.js'

export class AuthController {
  private readonly logger = createModuleLogger('AuthController')
  private readonly authService: AuthService = new AuthService()
  constructor() {}

  getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user

      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: 'Not authenticated'
        })
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'Current user retrieved successfully',
        data: user
      })
    } catch (error) {
      next(error)
    }
  }

  updateCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user
      const data = req.validated!.body as UpdateCurrentUserInput

      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: 'Not authenticated'
        })
      }
      const updatedUser = await this.authService.updateCurrentUser(user.id, data)

      res.status(HTTP_STATUS.OK).json({
        message: 'Current user updated successfully',
        data: updatedUser
      })
    } catch (error) {
      next(error)
    }
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.validated!.body as RegisterInput

      const result = await this.authService.register(data)

      res.status(HTTP_STATUS.CREATED).json({
        message: 'User created successfully',
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.validated!.body as LoginInput

      const result = await this.authService.loginWithPassword(data)

      res.status(HTTP_STATUS.OK).json({
        message: 'Login successful',
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: clear session from database

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

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.validated!.body as ForgotPasswordInput

      const result = await this.authService.forgotPassword(data)

      res.status(HTTP_STATUS.OK).json({
        message: 'Password reset email sent successfully',
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.validated!.body as PasswordResetInput

      const result = await this.authService.resetPassword(data)

      res.status(HTTP_STATUS.OK).json({
        message: 'Password reset successfully',
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user
      const data = req.validated!.body as ChangePasswordInput

      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: 'Not authenticated'
        })
      }

      const result = await this.authService.changePassword(user.id, data)

      res.status(HTTP_STATUS.OK).json({
        message: 'Password changed successfully',
        data: result
      })
    } catch (error) {
      next(error)
    }
  }
}
