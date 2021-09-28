const { createLogger, format, transports } = require('winston')
const fs = require('fs')
const path = require('path')
const configs = require('./config')

// https://github.com/winstonjs/winston#logging
// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }

const { logDir } = configs
// eslint-disable-next-line no-console
console.log({ logDir })
if (!fs.existsSync(logDir)) {
  // eslint-disable-next-line no-console
  console.log('creating logs folder')
  fs.mkdirSync(logDir)
}

function formatParams(info) {
  //   const { timestamp, level = configs.LOG_LEVEL, message, ...args } = info
  //   const ts = timestamp.slice(0, 19).replace('T', ' ')
  if (info.method) {
    return `timestamp: ${info.timestamp} | level: ${info.level} | ip: ${
      info.ip
    } | method: ${JSON.stringify(info.method)} | endpoint: ${
      info.endpoint
    } | status: ${info.status} | message:  ${info.message}`
  }
  return `timestamp: ${info.timestamp} | level: ${info.level} | message:  ${info.message}`
}

// https://github.com/winstonjs/winston/issues/1135
const developmentFormat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.align(),
  format.printf(formatParams)
)

const productionFormat = format.combine(
  format.timestamp(),
  format.align(),
  format.printf(formatParams)
)

const logger = createLogger({
  level: configs.LOG_LEVEL,
  format:
    process.env.NODE_ENV === 'production'
      ? productionFormat
      : developmentFormat,
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(logDir, 'log.log'),
      // level: 'error',
      // handleExceptions: true,
      maxsize: 5242880, // 5MB
      timestamp: true,
    }),
  ],
})

const logGenerate = (response, method, ip, endpoint) => {
  return JSON.stringify({
    ...response,
    method,
    ip,
    endpoint,
  })
}

module.exports = { logger, logGenerate }
