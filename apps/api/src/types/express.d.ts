import type { z } from 'zod'
import { User } from './shared.js'

declare global {
  namespace Express {
    interface Request {
      validated?: {
        body?: unknown
        params?: unknown
        query?: unknown
      }
      user?: User
    }
  }
}

export {}
