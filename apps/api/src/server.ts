import app from './api.js'
import { cfg } from './config/internal.js'
import appConfig from './config/env.js'
import { createModuleLogger } from './infrastructure/logging/logger.js'
import { appInfo } from './config/appInfo.js'
import { transporter } from './infrastructure/mail/mail.client.js'
import { bootstrapFirstInvite } from './bootstrap/first-invite.js'
import { reminderScheduler } from './modules/notifications/reminder.scheduler.js'

const startedAt = performance.now()
const logger = createModuleLogger('SERVER')

/** Message + stack: JSON.stringify(error) would print `{}`. */
function describeError(err: unknown) {
  return err instanceof Error ? (err.stack ?? err.message) : String(err)
}

async function startServer() {
  const server = app.listen(appConfig.port, '0.0.0.0', () => {
    logger.info(`${appInfo.name} v${appInfo.version} running on port ${appConfig.port}`)
  })

  return server
}

const registerShutdownHandlers = (server: ReturnType<typeof app.listen>) => {
  process.on('SIGINT', () => shutdown(server, 'SIGINT'))
  process.on('SIGTERM', () => shutdown(server, 'SIGTERM'))

  // The logger uses winston's npm levels: there is no `crit` (its types also declare the
  // syslog levels, so a wrong level compiles and then crashes at runtime).
  process.on('uncaughtException', err => {
    logger.error(`Uncaught exception: ${describeError(err)}`)
    process.exit(1)
  })

  process.on('unhandledRejection', reason => {
    logger.error(`Unhandled promise rejection: ${describeError(reason)}`)
    process.exit(1)
  })
}

async function shutdown(server: ReturnType<typeof app.listen>, signal: string) {
  logger.info(`${signal} received. Starting graceful shutdown...`)

  // Let a reminder pass in progress finish, so its claimed reminders are delivered
  await reminderScheduler.stop()

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

  if (transporter) {
    logger.info('Verifying SMTP connection...')
    await transporter.verify()
    logger.info('SMTP connection verified.')
  } else {
    logger.warn('SMTP is disabled.')
  }

  await bootstrapFirstInvite()

  logger.info('Starting HTTP server...')
  const server = await startServer()

  registerShutdownHandlers(server)

  reminderScheduler.start()

  logger.info(`Application ready in ${Math.round(performance.now() - startedAt)} ms`)
} catch (err: unknown) {
  logger.error(`Startup failed: ${describeError(err)}`)
  process.exit(1)
}
