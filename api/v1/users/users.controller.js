const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const createHttpError = require('http-errors')
const User = require('./users.model')
const Response = require('../../../utils/response')
const { ACCESS_TOKEN_SECRET } = require('../../../configs/config')
const eventEmitter = require('./users.events')
const { logger, logGenerate } = require('../../../configs/logger')

module.exports.register = async (req, res, next) => {
  try {
    const doesExist = await User.findOne({ email: req.body.email }).lean()
    if (doesExist)
      throw createHttpError.Conflict(`${req.body.email} already exists.`)
    const user = new User(req.body)
    await user.save()
    const response = new Response(
      201,
      'User created successfully. Go to your email to verify your account.'
    )
    logger.info(logGenerate(response, req.method, req.ip, req.originalUrl))
    res.status(response.statusCode).json(response)

    const data = {
      payload: user,
      host: req.headers.host,
      baseUrl: req.baseUrl,
      metadata: {
        tasks: ['email'],
      },
    }

    eventEmitter.emit('sendEmailEvent', data, 'verificationEmail')
  } catch (err) {
    logger.error(err)
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
        eventEmitter.emit('userLoginHistory', userRequestInfo)

        response = response.generate(200, 'Login Successful', data)
      } else {
        response = response.generate(401, 'Invalid Password')
      }
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

module.exports.sendVerificationEmail = async (req, res) => {
  const data = {
    payload: req.payload,
    host: req.headers.host,
    baseUrl: req.baseUrl,
    metadata: {
      tasks: ['email'],
    },
  }

  const part1 = req.payload.email.slice(0, 3)
  const part2 = req.payload.email.split('.')[1]
  const resEmail = `${part1}*****.${part2}`

  eventEmitter.emit('sendEmailEvent', data, 'verificationEmail')
  res
    .status(200)
    .send(
      `Email verification link has been sent to your registered email id ${resEmail}`
    )
}

module.exports.sendResetPasswordEmail = async (req, res) => {
  const data = {
    payload: req.payload,
    host: req.headers.host,
    baseUrl: req.baseUrl,
    metadata: {
      tasks: ['passwd'],
    },
  }

  const part1 = req.payload.email.slice(0, 3)
  const part2 = req.payload.email.split('.')[1]
  const resEmail = `${part1}*****.${part2}`

  eventEmitter.emit('sendEmailEvent', data, 'resetPasswordEmail')

  res
    .status(200)
    .send(
      `Reset password link has been generated and successfully sent to your registered email id ${resEmail}`
    )
}

module.exports.verifyUserEmail = async (req, res, next) => {
  try {
    if (!req.payload.metadata.tasks) {
      throw createHttpError.Unauthorized(
        'Token is not valid for updating email status'
      )
    }

    if (req.payload.metadata.tasks.indexOf('email') === -1) {
      throw createHttpError.Unauthorized(
        'Token is not valid for updating email status'
      )
    }

    // eslint-disable-next-line no-unused-vars
    const user = await User.findOneAndUpdate(
      { email: req.payload.email },
      { isVerified: true },
      { new: true }
    )

    res.status(200).send('Your account has been verified successfully.')
  } catch (err) {
    next(err)
  }
}

module.exports.updateUserPassword = async (req, res, next) => {
  try {
    if (!req.payload.metadata.tasks) {
      throw createHttpError.Unauthorized(
        'Token is not valid for updating email status'
      )
    }

    if (req.payload.metadata.tasks.indexOf('passwd') === -1) {
      throw createHttpError.Unauthorized(
        'Token is not valid for updating reseting password'
      )
    }

    const newUserPassword = await bcrypt.hash(req.body.password, 10)
    // eslint-disable-next-line no-unused-vars
    const user = await User.findOneAndUpdate(
      { email: req.payload.email },
      { password: newUserPassword },
      { new: true }
    )

    res.status(200).send('Password has been changed successfully.')
  } catch (err) {
    next(err)
  }
}
