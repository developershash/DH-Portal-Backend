const jwt = require('jsonwebtoken')
const createHttpError = require('http-errors')
const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} = require('../configs/config')

module.exports = {
  signAccessToken: (data, eat) => {
    return new Promise((resolve, reject) => {
      const payload = {
        email: data.payload.email,
        username: data.payload.username,
        metadata: data.metadata,
      }

      const secret = ACCESS_TOKEN_SECRET

      const options = {
        expiresIn: eat,
        issuer: 'developershash.com',
      }

      jwt.sign(payload, secret, options, (err, token) => {
        if (err) {
          return reject(createHttpError.InternalServerError())
        }
        return resolve(token)
      })
    })
  },
  verifyAccessToken: (req, res, next) => {
    if (!req.headers.authorization) return next(createHttpError.Unauthorized())

    const authHeader = req.headers.authorization
    const bearerToken = authHeader.split(' ')
    const token = bearerToken[1]

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        if (err.name !== 'JsonWebTokenError')
          return next(createHttpError.Unauthorized(err))
        return next(createHttpError.Unauthorized())
      }

      req.payload = payload
      return next()
    })
    return null
  },
  signRefreshToken: (user) => {
    return new Promise((resolve, reject) => {
      const payload = {
        id: user.id,
        email: user.email,
        username: user.username,
      }

      const secret = REFRESH_TOKEN_SECRET

      const options = {
        expiresIn: '24h',
        issuer: 'developershash.com',
      }

      jwt.sign(payload, secret, options, (err, token) => {
        if (err) {
          return reject(createHttpError.InternalServerError())
        }
        return resolve(token)
      })
    })
  },
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err) return reject(createHttpError.Unauthorized())

        const userId = payload.aud
        return resolve(userId)
      })
    })
  },
  jwt,
}
