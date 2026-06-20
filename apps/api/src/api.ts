import express from 'express'
import { correlationIdMiddleware } from './infrastructure/middleware/correlationId'
import { HTTP_STATUS } from './types/http'
import { morganMiddleware } from './infrastructure/middleware/morgan'
import { errorHandler } from './infrastructure/middleware/errorHandler'
import authRouter from './modules/auth/auth.route'

const app = express()

app.use(express.json())
app.use(correlationIdMiddleware)
app.use(morganMiddleware)

// health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(HTTP_STATUS.OK).json({ status: 'ok' })
})

app.use('/api/auth', authRouter)

// this should be the last middleware to ensure it catches all errors
app.use(errorHandler)

export default app
