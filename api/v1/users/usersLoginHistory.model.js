const mongoose = require('mongoose')

const { Schema } = mongoose

const userLoginHistorySchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      unique: true,
    },
    loggedOut: {
      type: Boolean,
    },
    lastLoggedInAt: {
      type: Date,

      default: new Date().getUTCDate(),
    },
    loggedOutAt: {
      type: Date,
    },
    ipAddress: {
      type: String,
    },
    device: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
)

userLoginHistorySchema.pre('save', async function (req, res, next) {
  try {
    next()
  } catch (err) {
    next(err)
  }
})

module.exports = mongoose.model('UserLoginHistory', userLoginHistorySchema)
