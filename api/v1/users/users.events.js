const createHttpError = require('http-errors')
const EventEmitter = require('events')
const path = require('path')
const ejs = require('ejs')
const mailer = require('../../../configs/email')
const { signAccessToken } = require('../../../utils/token')
const { SENDER_EMAIL } = require('../../../configs/config')
const userLoginHistory = require('./usersLoginHistory.model')

const eventEmitter = new EventEmitter()

async function prepareDataToSendMail(data, emailType) {
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
}

async function tryToSendEmail(mailOption, remainingAttempt, emailType) {
  if (remainingAttempt <= 0) return false

  try {
    const emailSendStatus = await mailer.sendEmail(mailOption)
    if (emailSendStatus.messageId) {
      // eslint-disable-next-line no-console
      console.log(`${emailType} : ${emailSendStatus.messageId}`)
      return true
    }
  } catch (error) {
    console.log(error.message)
    return tryToSendEmail(mailOption, remainingAttempt - 1, emailType)
  }
  return false
}

eventEmitter.on('sendEmailEvent', async (data, emailType) => {
  const mailOption = await prepareDataToSendMail(data, emailType)

  const wasMailSent = await tryToSendEmail(mailOption, 3, emailType)
  console.log(wasMailSent)
})

eventEmitter.on(
  'userLoginHistory',
  async (userRequestInfo) => {
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
      throw createHttpError.InternalServerError(error)
    }
  }

  // const token = await signAccessToken(req.payload, '1h', metadata)

  // const link = `http://${req.headers.host}${req.baseUrl}/email/verification/${token}`

  // const data = await ejs.renderFile(
  //   path.join(__dirname, '../../..', 'views/email_verification.ejs'),
  //   { link }
  // )

  // const mailOption = {
  //   to: req.payload.email,
  //   from: env.SENDER_EMAIL,
  //   text: token,
  //   html: data,
  // }

  // await mailer.sendEmail(mailOption)
)

module.exports = eventEmitter
