const { google } = require('googleapis')
const nodemailer = require('nodemailer')
const { logger } = require('./logger')
const Response = require('../utils/response')

const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  REFRESH_TOKEN,
  SENDER_EMAIL,
} = require('./config')

const OAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
)

OAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

const setupTransporter = (async () => {
  try {
    const accessToken = await OAuth2Client.getAccessToken()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: SENDER_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken,
      },
    })

    return transporter
  } catch (err) {
    const response = new Response(
      err.response.status,
      `${err.message} : ${err.response.data.error_description}`
    )
    logger.error(response)
    return null
  }
})()

const resolveTransporter = async () => {
  return setupTransporter
}

module.exports.sendEmail = async (mailOption) => {
  const gmailTransporter = await resolveTransporter()
  const emailSendStatus = await gmailTransporter.sendMail(mailOption)
  return emailSendStatus
}
