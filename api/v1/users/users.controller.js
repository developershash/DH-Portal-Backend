const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const createHttpError = require('http-errors')
const User = require('./users.model')
const Response = require('../../../utils/response')
const { ACCESS_TOKEN_SECRET } = require('../../../configs/config')
const userEvents = require('./users.events')
const { logger, logGenerate } = require('../../../configs/logger')
const { signAccessToken } = require('../../../utils/token')

module.exports.register = async (req, res, next) => {
  try {
    const doesExist = await User.findOne({ email: req.body.email }).lean()
    if (doesExist)
      throw createHttpError.Conflict(`${req.body.email} already exists.`)
    const user = new User(req.body)
    await user.save()

    const OTP = Math.floor(100000 + Math.random() * 900000)
    const otpHash = await bcrypt.hash(
      `${user.email}.${OTP}.${user.username}`,
      10
    )

    const data = {
      email: user.email,
      username: user.username,
      hash: otpHash,
      scope: 'verifyEmail',
    }

    const otpJwtToken = await signAccessToken(data, '5m')

    const response = new Response(
      201,
      'User created successfully. One time password has been sent to your email.',
      { token: otpJwtToken }
    )

    logger.info(logGenerate(response, req.method, req.ip, req.originalUrl))
    res.status(response.statusCode).json(response)

    userEvents.emit('sendEmailEvent', { ...data, OTP }, 'OTPEmail')
  } catch (err) {
    next(err)
  }
}

module.exports.login = async (req, res, next) => {
  let response = new Response()
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.userId }, { username: req.body.userId }],
    }).lean()
    if (!user) {
      return next(createHttpError.NotFound('User not found'))
    }
    bcrypt.compare(req.body.password, user.password, (err, success) => {
      if (err) {
        return next(
          createHttpError.InternalServerError(
            'Internal Server Error. Please try again after some time'
          )
        )
      }
      if (success) {
        const token = jwt.sign(
          { username: user.username, email: user.email },
          ACCESS_TOKEN_SECRET,
          {
            expiresIn: '2h',
          }
        )
        const data = {
          token,
        }
        const userRequestInfo = {
          username: user.username,
          loggedOut: false,
          lastLoggedInAt: new Date(),
          ipAddress:
            (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress,
          device: req.headers['user-agent'],
        }
        userEvents.emit('userLoginHistory', userRequestInfo)
        response = response.generate(200, 'Login Successful', data)
      } else {
        response = response.generate(401, 'Invalid Password')
      }
      logger.info(logGenerate(response, req.method, req.ip, req.originalUrl))
      return res.status(response.statusCode).json(response)
    })
    return null
  } catch (err) {
    return next(
      createHttpError.InternalServerError(
        'Internal Server Error. Please try again after some time'
      )
    )
  }
}

module.exports.sendOtpToEmail = async (req, res) => {
  const OTP = Math.floor(100000 + Math.random() * 900000)
  const otpHash = await bcrypt.hash(
    `${req.payload.email}.${OTP}.${req.payload.username}`,
    10
  )

  const data = {
    email: req.payload.email,
    username: req.payload.username,
    hash: otpHash,
    scope: 'verifyEmail',
  }

  const otpJwtToken = await signAccessToken(data, '5m')

  const part1 = req.payload.email.slice(0, 3)
  const part2 = req.payload.email.split('.')[1]
  const resEmail = `${part1}*****.${part2}`

  userEvents.emit('sendEmailEvent', { ...data, OTP }, 'OTPEmail')

  const message = `Email verification link has been sent successfully to your registered email id ${resEmail}`

  const response = new Response(200, message, { token: otpJwtToken })

  logger.info(logGenerate(response, req.method, req.ip, req.originalUrl))
  res.status(response.statusCode).json(response)
}

module.exports.sendResetPasswordEmail = async (req, res) => {
  const data = {
    payload: req.payload,
    host: req.headers.host,
    baseUrl: req.baseUrl,
    scope: 'updatePasswd',
  }

  const part1 = req.payload.email.slice(0, 3)
  const part2 = req.payload.email.split('.')[1]
  const resEmail = `${part1}*****.${part2}`

  userEvents.emit('sendEmailEvent', data, 'resetPasswordEmail')

  const message = `Reset password link has been generated and successfully sent to your registered email id ${resEmail}`

  const response = new Response(200, message)

  logger.info(logGenerate(response, req.method, req.ip, req.originalUrl))
  res.status(response.statusCode).json(response)
}

module.exports.verifyUserEmail = async (req, res, next) => {
  try {
    await User.findOneAndUpdate(
      { email: req.payload.email },
      { isVerified: true },
      { new: true }
    )

    const message = `Your account has been verified successfully.`

    const response = new Response(200, message)

    logger.info(logGenerate(response, req.method, req.ip, req.originalUrl))
    res.status(response.statusCode).json(response)
  } catch (err) {
    next(err)
  }
}

module.exports.updateUserPassword = async (req, res, next) => {
  try {
    const newUserPassword = await bcrypt.hash(req.body.password, 10)
    await User.findOneAndUpdate(
      { email: req.payload.email },
      { password: newUserPassword },
      { new: true }
    )

    const message = `Password has been changed successfully.`

    const response = new Response(200, message)

    logger.info(logGenerate(response, req.method, req.ip, req.originalUrl))
    res.status(response.statusCode).json(response)
  } catch (err) {
    next(err)
  }
}
