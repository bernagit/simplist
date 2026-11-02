import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUS } from '../../types/http.js'
import { AuthService } from './auth.service.js'
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  PasswordResetInput,
  RefreshTokenInput,
  RegisterInput,
  UpdateCurrentUserInput
} from './auth.schema.js'
import { createModuleLogger } from '../../infrastructure/logging/logger.js'
import {
  AUTH_COOKIES,
  clearAuthCookies,
  readCookie,
  setAuthCookies
} from '../../infrastructure/auth/cookies.js'
import { Errors } from '../../types/http.js'

/** Refresh token from the httpOnly cookie (web app) or the body (API clients). */
function getRefreshToken(req: Request) {
  const body = req.validated?.body as RefreshTokenInput
  return readCookie(req, AUTH_COOKIES.refresh) ?? body?.refreshToken
}

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

      const { user, ...tokens } = await this.authService.register(data)
      setAuthCookies(res, tokens)

      // Tokens are only in httpOnly cookies, never in the body
      res.status(HTTP_STATUS.CREATED).json({
        message: 'User created successfully',
        data: { user }
      })
    } catch (error) {
      next(error)
    }
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.validated!.body as LoginInput

      const { session, ...tokens } = await this.authService.loginWithPassword(data)
      setAuthCookies(res, tokens)

      res.status(HTTP_STATUS.OK).json({
        message: 'Login successful',
        data: { userId: session.userId }
      })
    } catch (error) {
      next(error)
    }
  }

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = getRefreshToken(req)
      if (refreshToken) {
        await this.authService.logout(refreshToken)
      }
      clearAuthCookies(res)
      res.status(HTTP_STATUS.OK).json({ message: 'Logout successful' })
    } catch (error) {
      next(error)
    }
  }

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = getRefreshToken(req)
      if (!refreshToken) {
        throw Errors.unauthorized('Missing refresh token')
      }
      // On failure the cookies are left alone on purpose: another tab may have just rotated
      // the token and set fresh cookies, which clearing would throw away. The client logs out.
      const tokens = await this.authService.refresh(refreshToken)
      setAuthCookies(res, tokens)
      res.status(HTTP_STATUS.OK).json({ message: 'Token refreshed successfully' })
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
