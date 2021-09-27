const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../swagger.json')

const customCss = fs.readFileSync(
  path.join(__dirname, '..', '/swagger.css'),
  'utf8'
)

module.exports = (app) => {
  app.use(cors())
  app.use(express.json({ limit: '50mb' }))
  app.use(express.urlencoded({ extended: false, limit: '50mb' }))
  app.set('view engine', 'ejs')
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, { customCss })
  )
}
