const express = require('express')
const { ENV, PORT } = require('./configs/app').CONFIGURATION

const app = express()

require('./configs/express')(app)
require('./configs/routes')(app)

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500).send({
    error: {
      status: err.status || 500,
      message: err.message || 'Something went wrong',
    },
  })
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `Express server is listening on port ${PORT} in ${ENV} environment`
  )
})
