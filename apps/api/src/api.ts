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
import invitesRouter from './modules/invites/invite.route.js'
import preferenceRouter from './modules/preferences/preference.route.js'
import notificationRouter from './modules/notifications/notification.route.js'
import appConfig from './config/env.js'
import { appInfo } from './config/appInfo.js'

const app = express()

// Served behind a reverse proxy (nginx) on the private/Docker network: trust its
// X-Forwarded-* headers for the client IP and protocol, but not those from anywhere else.
app.set('trust proxy', 'loopback, linklocal, uniquelocal')

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

// Health check, also used by the app's settings to show the API version it talks to
app.get('/api/health', (_req, res) => {
  res.status(HTTP_STATUS.OK).json({ status: 'ok', version: appInfo.version })
})

app.use('/api/auth', authRouter)
app.use('/api/invites', invitesRouter)
app.use('/api/lists', listRouter)
app.use('/api/sections', sectionRouter)
app.use('/api/tasks', taskRouter)
app.use('/api/base', baseRouter)
app.use('/api/preferences', preferenceRouter)
app.use('/api/notifications', notificationRouter)

// this should be the last middleware to ensure it catches all errors
app.use(errorHandler)

export default app
