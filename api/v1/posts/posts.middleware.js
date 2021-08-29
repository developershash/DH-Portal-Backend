const { createPostValidate, updatePostValidate } = require('./posts.validation')

const createPostMiddleware = (req, res, next) => {
  const { error, value } = createPostValidate.validate(req.body)
  req.body = value
  if (error) {
    return res.status(400).send(error.message)
  }
  return next()
}

const updatePostMiddleware = (req, res, next) => {
  const { error, value } = updatePostValidate.validate(req.body)
  req.body = value
  if (error) {
    return res.status(400).send(error.message)
  }
  return next()
}

module.exports = { createPostMiddleware, updatePostMiddleware }
