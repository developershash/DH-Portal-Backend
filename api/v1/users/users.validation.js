const Joi = require('joi')

const createUserValidate = Joi.object({
  firstName: Joi.string().lowercase().trim().required(),
  middleName: Joi.string().lowercase().trim(),
  lastName: Joi.string().lowercase().trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string()
    .pattern(
      new RegExp('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[-+_!@#$%^&*.,?])')
    )
    .trim()
    .min(8)
    .required(),
}).options({
  stripUnknown: true,
})

const loginUserValidate = Joi.object({
  userId: Joi.string().trim().required(),
  password: Joi.string().required(),
}).options({
  stripUnknown: true,
})

module.exports = { createUserValidate, loginUserValidate }
