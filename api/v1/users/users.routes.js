const express = require('express')
const userController = require('./users.controller')

const router = express.Router()

router.get('/', userController.test)

module.exports = router
