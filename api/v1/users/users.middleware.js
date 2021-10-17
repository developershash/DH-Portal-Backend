const uniqid = require('uniqid')
const createHttpError = require('http-errors')
const bcrypt = require('bcryptjs')
const User = require('./users.model')
const {
  createUserValidate,
  loginUserValidate,
  passwordValidate,
} = require('./users.validation')
const { jwt } = require('../../../utils/token')
const { ACCESS_TOKEN_SECRET } = require('../../../configs/config')

const createUserMiddleware = async (req, res, next) => {
  try {
    const validatedBody = await createUserValidate.validateAsync(req.body)
    const username = `${validatedBody.firstName}_${uniqid.time()}`
    Object.assign(validatedBody, { username })
    req.body = validatedBody
    return next()
  } catch (err) {
    if (err.isJoi === true) return next(createHttpError.BadRequest(err.message))
    return next(err)
  }
}

const loginUserMiddleware = async (req, res, next) => {
  try {
    const validatedBody = await loginUserValidate.validateAsync(req.body)
    req.body = validatedBody
    return next()
  } catch (err) {
    if (err.isJoi === true) return next(createHttpError.BadRequest(err.message))
    return next(err)
  }
}

const getUserMiddleware = async (req, res, next) => {
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.userId }, { username: req.body.userId }],
    })

    if (!user) {
      return next(
        createHttpError.NotFound(
          `We don't have any account registered with this credentials '${req.body.userId}' in our database.`
        )
      )
    }

    req.payload = {
      email: user.email,
      username: user.username,
    }
    return next()
  } catch (err) {
    if (err.isJoi === true) return next(createHttpError.NotFound(err.message))
    return next(err)
  }
}

const verifyTokenMiddleware = async (req, res, next) => {
  const accessToken = req.params.token

  try {
    jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        if (err.name === 'TokenExpiredError')
          throw createHttpError.Unauthorized('OTP is expired.')
        else if (err.name !== 'JsonWebTokenError')
          throw createHttpError.Unauthorized(err)
        throw createHttpError.Unauthorized()
      }

      req.payload = payload
      req.identity = { scope: payload.scope }
      next()
    })
  } catch (error) {
    next(error)
  }
}

const validateOTPMiddleware = async (req, res, next) => {
  try {
    const { email, username } = req.payload
    const OTP = parseInt(req.body.otp, 10)

    const otpHash = `${email}.${OTP}.${username}`

    bcrypt.compare(otpHash, req.payload.hash, (err, passed) => {
      if (err) {
        return next(createHttpError.Unauthorized('Invalid OTP'))
      }
      if (passed) {
        return next()
      }
      return next(createHttpError.Unauthorized('Invalid OTP'))
    })
  } catch (error) {
    next(error)
  }
}

const passwordValidateMiddleware = async (req, res, next) => {
  try {
    await passwordValidate.validateAsync(req.body.password)

    return next()
  } catch (err) {
    if (err.isJoi === true) return next(createHttpError.NotFound(err.message))
    return next(err)
  }
}

module.exports = {
  createUserMiddleware,
  loginUserMiddleware,
  verifyTokenMiddleware,
  getUserMiddleware,
  passwordValidateMiddleware,
  validateOTPMiddleware,
}
