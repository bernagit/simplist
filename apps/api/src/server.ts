import app from './api'
import { cfg } from './config/internal'
import appConfig from './config/env'
import { createModuleLogger } from './infrastructure/logging/logger'
import { appInfo } from './config/appInfo'

const logger = createModuleLogger('SERVER')

async function startServer() {
  const server = app.listen(appConfig.port, '0.0.0.0', () => {
    logger.info(`${appInfo.name} v${appInfo.version} running on port ${appConfig.port}`)
  })

  return server
}

const server = await startServer()

async function shutdown(signal: string) {
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

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

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
