const express = require('express')
const userRouter = require('./users/users.routes')
const postRouter = require('./posts/posts.routes')

const router = express()

router.use('/users', userRouter)
router.use('/posts', postRouter)

module.exports = router
