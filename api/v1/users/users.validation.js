const joi = require('joi')

const createUserValidate = joi
  .object({
    firstName: joi.string().lowercase().trim().required(),
    middleName: joi.string().lowercase().trim(),
    lastName: joi.string().lowercase().trim().required(),
    email: joi.string().email().lowercase().trim().required(),
    password: joi
      .string()
      .pattern(
        new RegExp('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[-+_!@#$%^&*.,?])')
      )
      .trim()
      .min(8)
      .required(),
  })
  .options({
    stripUnknown: true,
  })

module.exports = { createUserValidate }
