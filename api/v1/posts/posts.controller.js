const createError = require('http-errors')
const Post = require('./posts.model')

module.exports.getPosts = (req, res) => {
  res.send('All Posts')
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
