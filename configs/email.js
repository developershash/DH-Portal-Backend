const { google } = require('googleapis')
const nodemailer = require('nodemailer')
const createHttpError = require('http-errors')

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
    throw createHttpError.InternalServerError(err)
  }
})()

const resolveTransporter = async () => {
  return setupTransporter
}

module.exports.sendEmail = async (mailOption) => {
  try {
    const gmailTransporter = await resolveTransporter()
    const emailSendStatus = await gmailTransporter.sendMail(mailOption)
    return emailSendStatus
  } catch (err) {
    throw createHttpError.InternalServerError(err)
  }
}
