const mongoose = require('mongoose')

const { Schema } = mongoose

const postSchema = new Schema(
  {
    htmlContent: {
      type: String,
      required: true,
    },
    tags: {
      type: Array,
      required: true,
      index: 'text',
    },
    reactions: {
      clapped: {
        type: Array,
      },
    },
    postedBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Post', postSchema)
