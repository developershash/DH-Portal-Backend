// const mongoose = require('mongoose')
// const createError = require('http-errors')
const createHttpError = require('http-errors')
const User = require('./users.model')
// const Response = require('../../../utils/response')

module.exports.test = (req, res) => {
  res.send('OK')
}

module.exports.register = async (req, res, next) => {
  try {
    const doesExist = await User.findOne({ email: req.body.email }).lean()
    if (doesExist)
      throw createHttpError.Conflict(`${req.body.email} already exists.`)
    const user = new User(req.body)
    const result = await user.save()
    res.send(result)
  } catch (err) {
    next(err)
  }
}
