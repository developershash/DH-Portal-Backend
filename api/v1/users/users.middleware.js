const uniqid = require('uniqid')
const createHttpError = require('http-errors')
const { createUserValidate, loginUserValidate } = require('./users.validation')

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

module.exports = { createUserMiddleware, loginUserMiddleware }
