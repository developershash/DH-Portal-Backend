const jwt = require('jsonwebtoken')
const createHttpError = require('http-errors')
const env = require('../configs/config')

module.exports = {
  signAccessToken: (user, eat, metadata) => {
    return new Promise((resolve, reject) => {
      const payload = {
        id: user.id,
        email: user.email,
        username: user.username,
        metadata,
      }

      const secret = env.ACCESS_TOKEN_SECRET

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

    jwt.verify(token, env.ACCESS_TOKEN_SECRET, (err, payload) => {
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

      const secret = env.REFRESH_TOKEN_SECRET

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
      jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err) return reject(createHttpError.Unauthorized())

        const userId = payload.aud
        return resolve(userId)
      })
    })
  },
  jwt,
}
