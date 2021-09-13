const createHttpError = require('http-errors')
const EventEmitter = require('events')
const path = require('path')
const ejs = require('ejs')
const mailer = require('../../../configs/email')
const { signAccessToken } = require('../../../utils/token')
const { SENDER_EMAIL } = require('../../../configs/config')

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

eventEmitter.on('sendEmailEvent', async (data, emailType) => {
  const mailOption = await prepareDataToSendMail(data, emailType)

  for (let i = 0; i < 3; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const emailSendStatus = await mailer.sendEmail(mailOption)
    if (emailSendStatus.messageId) {
      // eslint-disable-next-line no-console
      console.log(`${emailType} : ${emailSendStatus.messageId}`)
      return
    }
  }
  throw createHttpError.InternalServerError('Email was not sent.')
})

module.exports = eventEmitter
