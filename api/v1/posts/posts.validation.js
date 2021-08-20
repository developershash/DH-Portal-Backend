// Add JOI validation here
const Joi = require('joi')

const postSchema = Joi.object({
  htmlContent: Joi.string().required(),
  tags: Joi.array().items(Joi.string().required()).required(),
  postedBy: Joi.string().required(),
})

module.exports = postSchema
