import app from './api.js'
import { cfg } from './config/internal.js'
import appConfig from './config/env.js'
import { createModuleLogger } from './infrastructure/logging/logger.js'
import { appInfo } from './config/appInfo.js'
import { transporter } from './infrastructure/mail/mail.client.js'
import { bootstrapFirstInvite } from './bootstrap/first-invite.js'

const startedAt = performance.now()
const logger = createModuleLogger('SERVER')

async function startServer() {
  const server = app.listen(appConfig.port, '0.0.0.0', () => {
    logger.info(`${appInfo.name} v${appInfo.version} running on port ${appConfig.port}`)
  })

  return server
}

const registerShutdownHandlers = (server: ReturnType<typeof app.listen>) => {
  process.on('SIGINT', () => shutdown(server, 'SIGINT'))
  process.on('SIGTERM', () => shutdown(server, 'SIGTERM'))

  process.on('uncaughtException', err => {
    logger.crit(`${err instanceof Error ? err.message : String(err)}`, 'Uncaught exception')
    process.exit(1)
  })

  process.on('unhandledRejection', reason => {
    logger.crit(
      `${reason instanceof Error ? reason.message : String(reason)}`,
      'Unhandled promise rejection'
    )
    process.exit(1)
  })
}

async function shutdown(server: ReturnType<typeof app.listen>, signal: string) {
  logger.info(`${signal} received. Starting graceful shutdown...`)

  server.close(async err => {
    if (err) {
      logger.error(
        `${err instanceof Error ? err.message : String(err)}`,
        'Error during server shutdown'
      )
      process.exit(1)
    }

    logger.info('HTTP server closed')

    process.exit(0)
  })

  // force shutdown timeout
  setTimeout(() => {
    logger.error('Forced shutdown timeout reached')
    process.exit(1)
  }, cfg.SHUTDOWN_TIMEOUT_MS).unref()
}

try {
  logger.info('Starting application...')

  logger.info('Verifying SMTP connection...')
  await transporter.verify()
  logger.info('SMTP connection verified.')

  await bootstrapFirstInvite()

  logger.info('Starting HTTP server...')
  const server = await startServer()

  registerShutdownHandlers(server)

  logger.info(`Application ready in ${Math.round(performance.now() - startedAt)} ms`)
} catch (err: unknown) {
  logger.crit('Uncaught exception', {
    err
  })
  process.exit(1)
}
