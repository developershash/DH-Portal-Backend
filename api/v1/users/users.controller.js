const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const createHttpError = require('http-errors')
const User = require('./users.model')
const Response = require('../../../utils/response')
const env = require('../../../configs/config')
const eventEmitter = require('./users.events')

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

    res.status(response.statusCode).json(response)

    req.payload = user
    const metadata = {
      tasks: ['email'],
    }

    eventEmitter.emit('sendVerificationEmail', req, metadata)
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
          env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: '2h',
          }
        )
        const data = {
          token,
        }
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
  eventEmitter.emit('sendVerificationEmail', req)
  res
    .status(200)
    .send(
      `Email verification link has been sent to your registered email id ${req.payload.email}`
    )
}

module.exports.sendResetPasswordEmail = async (req, res) => {
  eventEmitter.emit('sendResetPasswordEmail', req)
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
