// Add JOI validation here
const Joi = require('joi')

const createPostValidate = Joi.object({
  htmlContent: Joi.string().required(),
  tags: Joi.array().items(Joi.string().required()).max(5).required(),
})

const updatePostValidate = Joi.object({
  htmlContent: Joi.string().optional(),
  tags: Joi.array().items(Joi.string().required()).max(5).optional(),
})

module.exports = { createPostValidate, updatePostValidate }
