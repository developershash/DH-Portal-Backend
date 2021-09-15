const mongoose = require('mongoose')
const { logger } = require('./logger')

/* eslint-disable no-console */
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  require('dotenv').config()
}

const CONFIGURATION = {
  DB_URI: process.env.DB_URI,
  ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
}

mongoose.connect(CONFIGURATION.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
})
mongoose.connection.once('open', () => {
  logger.info(`MongoDB connected to ${CONFIGURATION.DB_URI}`)
})
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB Connection Error ${err}`)
  process.exit(-1)
})

module.exports = { CONFIGURATION }
