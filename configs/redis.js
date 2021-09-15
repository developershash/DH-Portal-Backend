const Redis = require('redis')
const { logger } = require('./logger')

function createRedisClient(configs) {
  const client = Redis.createClient(configs)

  client.on('connect', () => {
    logger.info(`Redis is connected to HOST: ${configs.host}`)
  })

  client.on('error', () => {
    logger.error(`Redis connection failed to HOST: ${configs.host}`)
  })

  return client
}

module.exports = { createRedisClient }
