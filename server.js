const express = require('express')
const { createRedisClient } = require('./configs/redis')
const configs = require('./configs/config')
const { ENV, PORT } = require('./configs/app').CONFIGURATION
const { logger, logGenerate } = require('./configs/logger')

const app = express()

require('./configs/express')(app)
require('./configs/routes')(app)

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(logGenerate(err, req.method, req.ip, req.originalUrl))
  res.status(err.status || 500).send({
    error: {
      status: err.status || 500,
      message: err.message || 'Something went wrong',
    },
  })
})

function boot() {
  global.redisClient = createRedisClient(configs.redis)
  app.listen(PORT, () => {
    logger.info(
      `Express server is listening on port ${PORT} in ${ENV} environment`
    )
  })
}

boot()
