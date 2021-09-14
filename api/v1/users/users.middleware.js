const uniqid = require('uniqid')
const createHttpError = require('http-errors')
const User = require('./users.model')
const {
  createUserValidate,
  loginUserValidate,
  emailValidate,
  passwordValidate,
  usernameValidate,
} = require('./users.validation')
const { jwt } = require('../../../utils/token')
const env = require('../../../configs/config')

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

const verifyTokenMiddleware = async (req, res, next) => {
  const accessToken = req.params.token

  try {
    jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        if (err.name !== 'JsonWebTokenError')
          throw createHttpError.Unauthorized(err)
        throw createHttpError.Unauthorized()
      }

      req.payload = payload
      next()
    })
  } catch (error) {
    next(error)
  }
}

const getUserMiddleware = async (req, res, next) => {
  try {
    let email
    let username

    if (req.body.email)
      email = await emailValidate.validateAsync(req.body.email)
    else username = await usernameValidate.validateAsync(req.body.username)

    const user = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (!user) {
      return next(
        createHttpError.NotFound(
          `We don't have any account registered with this credentials '${
            email || username
          }' in our database.`
        )
      )
    }

    req.payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    }
    next()
    return null
  } catch (err) {
    if (err.isJoi === true) return next(createHttpError.NotFound(err.message))
    return next(err)
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
}
