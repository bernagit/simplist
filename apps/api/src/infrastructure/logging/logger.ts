import { createLogger, transports, format, Logger } from 'winston'
import { TransformableInfo } from 'logform'
import { requestContext } from './requestContext'
import appConfig from '../../config/env'

const { combine, timestamp, printf, colorize } = format

interface CustomLogEntry extends TransformableInfo {
  module?: string
  timestamp?: string
  correlationId?: string
}

const SPLAT = Symbol.for('splat')

const correlationIdFormat = format(info => {
  const correlationId = requestContext.getStore()?.correlationId

  info.correlationId = correlationId

  return info
})

const logFormat = printf((info: CustomLogEntry) => {
  const { level, message, module, timestamp, correlationId } = info

  const extra = (info as Record<PropertyKey, unknown>)[SPLAT] as unknown[] | undefined

  const baseMsg = typeof message === 'string' ? message : JSON.stringify(message)

  const extraMsg =
    extra && extra.length
      ? ' ' + extra.map(v => (typeof v === 'string' ? v : JSON.stringify(v))).join(' ')
      : ''

  const time = timestamp
    ? timestamp.replace('T', ' ').replace('Z', '')
    : new Date().toISOString().replace('T', ' ').replace('Z', '')

  const moduleTag = module ?? 'SYSTEM'

  const correlationTag = correlationId ? `[${correlationId}] ` : ''

  return `${correlationTag}[${moduleTag}: ${level}] - ${time} | ${baseMsg}${extraMsg}`
})

export const logger: Logger = createLogger({
  level: appConfig.logLevel,
  transports: [
    new transports.Console({
      format: combine(
        correlationIdFormat(),
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss.SSS'
        }),
        colorize({ all: true }),
        logFormat
      )
    })
  ]
})

export function createModuleLogger(module: string): Logger {
  return logger.child({
    module: module.toUpperCase()
  })
}
