const EventEmitter = require('events')
const path = require('path')
const ejs = require('ejs')
const mailer = require('../../../configs/email')
const { signAccessToken } = require('../../../utils/token')
const { SENDER_EMAIL, emailRetryLimit } = require('../../../configs/config')
const userLoginHistory = require('./usersLoginHistory.model')
const Response = require('../../../utils/response')
const { logger } = require('../../../configs/logger')

const eventEmitter = new EventEmitter()

async function prepareDataToSendMail(data, emailType) {
  try {
    const tokenForEmail = await signAccessToken(data, '1h')

    let emailRedirectLink
    let emailTemplate
    let subject

    if (emailType === 'verificationEmail') {
      emailRedirectLink = `http://${data.host}${data.baseUrl}/email/verification/${tokenForEmail}`

      emailTemplate = await ejs.renderFile(
        path.join(__dirname, '../../..', 'views/email_verification.ejs'),
        { link: emailRedirectLink }
      )

      subject = '[DevelopersHash] Please verify your email address'
    } else if (emailType === 'resetPasswordEmail') {
      emailRedirectLink = `http://${data.host}${data.baseUrl}/password/reset/${tokenForEmail}`

      emailTemplate = await ejs.renderFile(
        path.join(__dirname, '../../..', 'views/reset_password.ejs'),
        { link: emailRedirectLink }
      )

      subject = '[DevelopersHash] Please reset your password'
    }

    const mailOption = {
      to: data.payload.email,
      from: SENDER_EMAIL,
      subject,
      text: tokenForEmail,
      html: emailTemplate,
    }

    return mailOption
  } catch (err) {
    throw new Response(err.status || 500, err.message)
  }
}

async function sendEmail(mailOption, currentAttempt) {
  if (currentAttempt >= emailRetryLimit) return { status: false }

  try {
    const emailSendStatus = await mailer.sendEmail(mailOption)
    if (emailSendStatus.messageId) {
      return { status: true, message: emailSendStatus.messageId }
    }
  } catch (error) {
    logger.error(
      `Attempting to send email ${currentAttempt + 1} / ${emailRetryLimit} :  ${
        error.message
      }`
    )
    const status = await sendEmail(mailOption, currentAttempt + 1)
    status.message = status.message || error.message
    return status
  }
  return { status: false }
}

eventEmitter.on('sendEmailEvent', async (data, emailType) => {
  try {
    let response
    const mailOption = await prepareDataToSendMail(data, emailType)
    const wasMailSent = await sendEmail(mailOption, 0, emailType)

    if (wasMailSent.status)
      response = new Response(200, `${emailType} : ${wasMailSent.message}`)
    else throw new Response(500, wasMailSent.message)

    logger.info(response)
  } catch (err) {
    logger.error(err)
  }
})

eventEmitter.on('userLoginHistory', async (userRequestInfo) => {
  try {
    await userLoginHistory.findOneAndUpdate(
      { username: userRequestInfo.username },
      userRequestInfo,
      {
        new: true,
        upsert: true, // Make this update into an upsert
      }
    )
    /* continue as normal */
  } catch (error) {
    const response = new Response(500, error)
    throw response
  }
})

module.exports = eventEmitter
