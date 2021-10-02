const express = require('express')
const guard = require('express-jwt-permissions')({
  requestProperty: 'identity',
  permissionsProperty: 'scope',
})
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
  async (req, res, next) => {
    try {
      const payload = await verifyAccessToken(req.headers.authorization)
      req.payload = payload
      next()
    } catch (err) {
      next(err)
    }
  },
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
  guard.check('verifyEmail'),
  userController.verifyUserEmail
)
router.put(
  '/password/reset/:token',
  verifyTokenMiddleware,
  guard.check('updatePasswd'),
  passwordValidateMiddleware,
  userController.updateUserPassword
)

module.exports = router
