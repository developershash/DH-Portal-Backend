/* eslint-disable consistent-return */
/* eslint-disable vars-on-top */
const nodemailer = require('nodemailer')
const { logger } = require('./logger')
const Response = require('../utils/response')
const { SMTP_EMAIL, SMTP_PASSWORD } = require('./config')

try {
  // eslint-disable-next-line no-var
  var gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASSWORD,
    },
  })
} catch (err) {
  const response = new Response(
    err.response.status,
    `${err.message} : ${err.response.data.error_description}`
  )
  logger.error(response)
}

module.exports.sendEmail = async (mailOption) => {
  // eslint-disable-next-line block-scoped-var
  const emailSendStatus = await gmailTransporter.sendMail(mailOption)
  return emailSendStatus
}
