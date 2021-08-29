const express = require('express')
const postController = require('./posts.controller')
const {
  createPostMiddleware,
  updatePostMiddleware,
} = require('./posts.middleware')

const router = express.Router()

router.get('/', postController.getPosts)
router.get('/:postId', postController.getAParticularPost)
router.post('/', createPostMiddleware, postController.createPost)
router.put('/:postId', updatePostMiddleware, postController.updatePost)

module.exports = router
