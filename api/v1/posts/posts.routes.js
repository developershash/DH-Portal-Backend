const express = require('express')
const postController = require('./posts.controller')

const router = express.Router()

router.get('/', postController.getPosts)
router.post('/', postController.createPost)
router.put('/:postId', postController.updatePost)

module.exports = router
