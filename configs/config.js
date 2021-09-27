/* eslint-disable no-console */
if (process.env.NODE_ENV !== 'production') {
  //   eslint-disable-next-line global-require
  require('dotenv').config()
}

const config = {
  ...process.env,
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  redis: {
    host: 'localhost',
    port: 6379,
    db: 0,
  },
  emailRetryLimit: 3,
}

module.exports = config

// const {
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URI,
//   REFRESH_TOKEN,
//   SENDER_EMAIL,
//   ACCESS_TOKEN_SECRET,
//   REFRESH_TOKEN_SECRET,
// } = process.env

// module.exports = {
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URI,
//   REFRESH_TOKEN,
//   SENDER_EMAIL,
//   ACCESS_TOKEN_SECRET,
//   REFRESH_TOKEN_SECRET,
// }
