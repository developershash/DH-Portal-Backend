const express = require('express')
const userController = require('./users.controller')
const {
  createUserMiddleware,
  loginUserMiddleware,
  verifyTokenMiddleware,
  getUserMiddleware,
  passwordValidateMiddleware,
} = require('./users.middleware')
const { verifyAccessToken } = require('../../../utils/token')

const router = express.Router()

router.post('/register', createUserMiddleware, userController.register)
router.post('/login', loginUserMiddleware, userController.login)

// ******************** sending emails *************************************

router.post(
  '/email/verification',
  verifyAccessToken,
  userController.sendVerificationEmail
)
router.post(
  '/password/reset',
  getUserMiddleware,
  userController.sendResetPasswordEmail
)

// ********** verifying response from emails ***************************

router.get(
  '/email/verification/:token',
  verifyTokenMiddleware,
  userController.verifyUserEmail
)
router.put(
  '/password/reset/:token',
  verifyTokenMiddleware,
  passwordValidateMiddleware,
  userController.updateUserPassword
)

module.exports = router
