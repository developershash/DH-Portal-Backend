const EventEmitter = require('events')
const path = require('path')
const ejs = require('ejs')
const mailer = require('../../../configs/email')
const { signAccessToken } = require('../../../utils/token')
const env = require('../../../configs/config')

const eventEmitter = new EventEmitter()

eventEmitter.on('sendVerificationEmail', async (req, metadata) => {
  const token = await signAccessToken(req.payload, '1h', metadata)

  const link = `http://${req.headers.host}${req.baseUrl}/email/verification/${token}`

  const data = await ejs.renderFile(
    path.join(__dirname, '../../..', 'views/email_verification.ejs'),
    { link }
  )

  const mailOption = {
    to: req.payload.email,
    from: env.SENDER_EMAIL,
    text: token,
    html: data,
  }

  await mailer.sendEmail(mailOption)
})

eventEmitter.on('sendResetPasswordEmail', async (req, metadata) => {
  const token = await signAccessToken(req.payload, '1h', metadata)

  const link = `http://${req.headers.host}${req.baseUrl}/password/reset/${token}`

  const data = await ejs.renderFile(
    path.join(__dirname, '../../..', 'views/reset_password.ejs'),
    { link }
  )

  const mailOption = {
    to: req.payload.email,
    from: env.SENDER_EMAIL,
    text: token,
    html: data,
  }

  await mailer.sendEmail(mailOption)
})

module.exports = eventEmitter
