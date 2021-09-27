const Joi = require('joi')

const customFields = {
  username: Joi.string()
    .pattern(
      new RegExp('^(?!_)(?:[A-Za-z0-9]+|([_])(?!\\1))*(?!_)([A-Za-z0-9])$')
    )
    .messages({
      'string.pattern.base':
        'Username must only contain alphnumeric characters and must not contain underscore at start and end and mutiple underscores in a row is not allowed',
    })
    .min(3)
    .trim()
    .required(),
  password: Joi.string()
    .pattern(
      new RegExp('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[-+_!@#$%^&*.,?])')
    )
    .trim()
    .min(8)
    .messages({
      'string.pattern.base':
        'Password must be atleast 8 characters long, with a mix of uppercase, lowercase, number and special characters',
    })
    .required(),
  email: Joi.string().email().lowercase().trim().required(),
}

const createUserValidate = Joi.object({
  firstName: Joi.string().lowercase().trim().required(),
  middleName: Joi.string().lowercase().trim(),
  lastName: Joi.string().lowercase().trim().required(),
  email: customFields.email,
  password: customFields.password,
}).options({
  stripUnknown: true,
})

const loginUserValidate = Joi.object({
  userId: Joi.string().trim().required(),
  password: Joi.string().required(),
}).options({
  stripUnknown: true,
})

const passwordValidate = customFields.password
const usernameValidate = customFields.username
const emailValidate = customFields.email

module.exports = {
  createUserValidate,
  loginUserValidate,
  passwordValidate,
  usernameValidate,
  emailValidate,
}
