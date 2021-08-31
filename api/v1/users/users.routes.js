const express = require('express')
const userController = require('./users.controller')
const {
  createUserMiddleware,
  loginUserMiddleware,
} = require('./users.middleware')

const router = express.Router()

router.post('/login', loginUserMiddleware, userController.login)
router.post('/register', createUserMiddleware, userController.register)

module.exports = router
