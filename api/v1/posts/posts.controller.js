const createError = require('http-errors')
const mongoose = require('mongoose')
const Post = require('./posts.model')
const Response = require('../../../utils/response')

module.exports.getPosts = (req, res) => {
  res.send('All Posts')
}

module.exports.getAParticularPost = async (req, res, next) => {
  let { postId } = req.params
  try {
    postId = mongoose.Types.ObjectId(postId)
    const result = await Post.findById(postId).lean()
    return res.send(result)
  } catch (err) {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      const response = new Response(400, 'Post ID is not valid')
      return res.status(400).json(response)
    }
    return next(createError.InternalServerError())
  }
}

module.exports.createPost = async (req, res) => {
  try {
    const post = new Post(req.body)
    const result = await post.save()
    res.send(result)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

module.exports.updatePost = async (req, res, next) => {
  const { postId } = req.params
  try {
    const result = await Post.findByIdAndUpdate(
      postId,
      {
        htmlContent: req.body.htmlContent,
      },
      { rawResult: true, new: true }
    )
    return res.send(result)
  } catch (err) {
    return next(createError.InternalServerError())
  }
}
