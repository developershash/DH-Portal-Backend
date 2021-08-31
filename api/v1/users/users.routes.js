const express = require('express')
const userController = require('./users.controller')
const { createUserMiddleware } = require('./users.middleware')

const router = express.Router()

router.post('/register', createUserMiddleware, userController.register)

module.exports = router
