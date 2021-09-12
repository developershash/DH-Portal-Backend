/* eslint-disable no-console */
if (process.env.NODE_ENV !== 'production') {
  //   eslint-disable-next-line global-require
  require('dotenv').config()
}

module.exports = process.env

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
