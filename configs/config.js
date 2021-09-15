/* eslint-disable no-console */
if (process.env.NODE_ENV !== 'production') {
  //   eslint-disable-next-line global-require
  require('dotenv').config()
}

module.exports = { ...process.env, emailRetryLimit: 3 }
