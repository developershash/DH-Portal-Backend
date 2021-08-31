const uniqid = require('uniqid')
const createHttpError = require('http-errors')
const { createUserValidate } = require('./users.validation')

const createUserMiddleware = async (req, res, next) => {
  try {
    const user = await createUserValidate.validateAsync(req.body)
    const username = `${user.firstName}_${uniqid.time()}`
    Object.assign(user, { username })
    req.body = user
    return next()
  } catch (err) {
    if (err.isJoi === true) return next(createHttpError.BadRequest(err.message))
    return next(err)
  }
}

module.exports = { createUserMiddleware }
