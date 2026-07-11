import express from 'express'
import cors from 'cors'
import { correlationIdMiddleware } from './infrastructure/middleware/correlationId'
import { HTTP_STATUS } from './types/http'
import { morganMiddleware } from './infrastructure/middleware/morgan'
import { errorHandler } from './infrastructure/middleware/errorHandler'
import authRouter from './modules/auth/auth.route'
import listRouter from './modules/list/list.route'
import sectionRouter from './modules/section/section.route'
import taskRouter from './modules/task/task.route'
import baseRouter from './modules/base/base.route'
import cookieParser from 'cookie-parser'
import appConfig from './config/env'

const app = express()

app.use(express.json())
app.use(correlationIdMiddleware)
app.use(morganMiddleware)
app.use(cookieParser())
// CORS middleware
app.use(
  cors({
    origin: appConfig.corsOrigin,
    credentials: true
  })
)

// health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(HTTP_STATUS.OK).json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/lists', listRouter)
app.use('/api/sections', sectionRouter)
app.use('/api/tasks', taskRouter)
app.use('/api/base', baseRouter)

// this should be the last middleware to ensure it catches all errors
app.use(errorHandler)

export default app
