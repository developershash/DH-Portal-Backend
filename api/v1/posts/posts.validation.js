// Add JOI validation here
const Joi = require('joi')

const createPostValidate = Joi.object({
  htmlContent: Joi.string().required(),
  tags: Joi.array().items(Joi.string().required()).max(5).required(),
  postedBy: Joi.string().required(),
})

module.exports = createPostValidate
