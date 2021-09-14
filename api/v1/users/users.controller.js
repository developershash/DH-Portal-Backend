const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const createHttpError = require('http-errors')
const User = require('./users.model')
const Response = require('../../../utils/response')
const env = require('../../../configs/config')
const userEvents = require('./users.events')
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

    req.payload = user
    const metadata = {
      tasks: ['email'],
    }

    userEvents.emit('sendVerificationEmail', req, metadata)
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
      logger.info('User not found')
      return next(createHttpError.NotFound('User not found'))
    }
    try {
      const success = await bcrypt.compare(req.body.password, user.password)
      if (success) {
        const token = jwt.sign(
          { username: user.username, email: user.email },
          env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: '2h',
          }
        )
        // set token in redis
        try {
          await global.redisClient.set(req.body.userId, token)
          const data = {
            token,
          }
          response = response.generate(200, 'Login Successful', data)
        } catch (error) {
          logger.error(error)
          throw new Error(
            'Internal Server Error. Please try again after some time'
          )
        }
      } else {
        response = response.generate(401, 'Invalid Password')
        logger.info(response)
        return res.status(response.statusCode).json(response)
      }
      logger.info(response)
      return res.status(response.statusCode).json(response)
    } catch (err) {
      logger.error(err)
      throw new Error('Internal Server Error. Please try again after some time')
    }
  } catch (err) {
    logger.error(err)
    return next(
      createHttpError.InternalServerError(
        'Internal Server Error. Please try again after some time'
      )
    )
  }
}

module.exports.sendVerificationEmail = async (req, res) => {
  userEvents.emit('sendVerificationEmail', req)
  res
    .status(200)
    .send(
      `Email verification link has been sent to your registered email id ${req.payload.email}`
    )
}

module.exports.sendResetPasswordEmail = async (req, res) => {
  userEvents.emit('sendResetPasswordEmail', req)
  res
    .status(200)
    .send(
      `Reset password link has been generated and successfully sent to your registered email id ${req.payload.email}`
    )
}

module.exports.verifyUserEmail = async (req, res, next) => {
  try {
    let isValidToChangeEmail = false
    req.payload.metadata.tasks.forEach((task) => {
      if (task === 'email') isValidToChangeEmail = true
    })

    if (isValidToChangeEmail) {
      // eslint-disable-next-line no-unused-vars
      const user = await User.findOneAndUpdate(
        { email: req.payload.email },
        { isVerified: true },
        { new: true }
      )
      res.status(200).send('Your account has been verified successfully.')
    } else {
      throw createHttpError.Unauthorized(
        'Token is not valid for updating email status'
      )
    }
  } catch (err) {
    next(err)
  }
}

module.exports.updateUserPassword = async (req, res, next) => {
  try {
    const newPassword = await bcrypt.hash(req.body.password, 10)
    // eslint-disable-next-line no-unused-vars
    const user = await User.findOneAndUpdate(
      { _id: req.payload.id },
      { password: newPassword },
      { new: true }
    )
    res.status(200).send('Password has been changed successfully.')
  } catch (err) {
    next(err)
  }
}
