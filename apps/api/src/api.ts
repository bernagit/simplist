import express from 'express'
import cors from 'cors'
import { correlationIdMiddleware } from './infrastructure/middleware/correlationId.js'
import { HTTP_STATUS } from './types/http.js'
import { morganMiddleware } from './infrastructure/middleware/morgan.js'
import { errorHandler } from './infrastructure/middleware/errorHandler.js'
import authRouter from './modules/auth/auth.route.js'
import listRouter from './modules/list/list.route.js'
import sectionRouter from './modules/section/section.route.js'
import taskRouter from './modules/task/task.route.js'
import baseRouter from './modules/base/base.route.js'
import preferenceRouter from './modules/preferences/preference.route.js'
import appConfig from './config/env.js'

const app = express()

app.use(express.json())
app.use(correlationIdMiddleware)
app.use(morganMiddleware)
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
app.use('/api/preferences', preferenceRouter)

// this should be the last middleware to ensure it catches all errors
app.use(errorHandler)

export default app
