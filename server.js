const express = require('express')
const { ENV, PORT } = require('./configs/app').CONFIGURATION

const app = express()

require('./configs/express')(app)
require('./configs/routes')(app)

app.use((err, req, res) => {
  // console.error(err.stack)
  return res
    .status(err.status || 500)
    .send(err.message || 'Something went wrong')
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `Express server is listening on port ${PORT} in ${ENV} environment`
  )
})
