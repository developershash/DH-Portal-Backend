const mongoose = require('mongoose')

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
      required: [true, 'Middle Name is a required field'],
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
      unique: true,
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
      default: true,
    },
    githubLink: {
      type: String,
    },
  },
  {
    strict: true,
    runSettersOnQuery: true,
    timestamps: {
      createdAt: 'created',
      updatedAt: 'updated',
    },
  }
)

module.exports = mongoose.model('User', userSchema)
