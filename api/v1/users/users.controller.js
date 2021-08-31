const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const createHttpError = require('http-errors')
const User = require('./users.model')
const Response = require('../../../utils/response')

module.exports.register = async (req, res, next) => {
  try {
    const doesExist = await User.findOne({ email: req.body.email }).lean()
    if (doesExist)
      throw createHttpError.Conflict(`${req.body.email} already exists.`)
    const user = new User(req.body)
    await user.save()
    const response = new Response(201, 'User created successfully')
    res.status(response.statusCode).json(response)
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
          process.env.TOKEN_KEY,
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
