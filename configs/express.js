const express = require('express')
const cors = require('cors')

module.exports = (app) => {
  app.use(cors())
  app.use(express.json({ limit: '50mb' }))
  app.use(express.urlencoded({ limit: '50mb' }))
}
