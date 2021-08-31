const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const { Schema } = mongoose

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'First Name is a required field'],
    },
    middleName: {
      type: String,
      trim: true,
      lowercase: true,
    },
    lastName: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'Last Name is a required field'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: [true, 'Email already exists'],
      required: [true, 'Email is a required field'],
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, 'Username is a required field'],
    },
    bio: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'password is a required field'],
    },
    gender: {
      type: String,
      trim: true,
      uppercase: true,
      enum: ['M', 'F', 'O', null],
      required: false,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: new Date().getUTCDate(),
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    githubLink: {
      type: String,
    },
  },
  {
    strict: true,
    runSettersOnQuery: true,
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
)

userSchema.pre('save', async function (req, res, next) {
  try {
    this.password = await bcrypt.hash(this.password, 10)
    next()
  } catch (err) {
    next(err)
  }
})

module.exports = mongoose.model('User', userSchema)
