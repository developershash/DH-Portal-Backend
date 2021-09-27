const jwt = require('jsonwebtoken')
const Response = require('./response')
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
        scope: data.scope,
      }

      const secret = ACCESS_TOKEN_SECRET

      const options = {
        expiresIn: eat,
        issuer: 'developershash.com',
      }

      jwt.sign(payload, secret, options, (err, token) => {
        if (err) {
          const response = new Response(500, err)
          return reject(response)
        }
        return resolve(token)
      })
    })
  },
  verifyAccessToken: (authHeader) => {
    return new Promise((resolve, reject) => {
      if (!authHeader) return reject(new Response(401, 'Unauthorized Access'))
      const bearerToken = authHeader.split(' ')
      const token = bearerToken[1]
      jwt.verify(token, ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
          if (err.name !== 'JsonWebTokenError')
            return reject(new Response(401, err))
          return reject(new Response(401, 'Unauthorized Access'))
        }
        return resolve(payload)
      })
      return null
    })
  },
  signRefreshToken: (data, eat) => {
    return new Promise((resolve, reject) => {
      const payload = {
        id: data.id,
        email: data.email,
        username: data.username,
      }

      const secret = REFRESH_TOKEN_SECRET

      const options = {
        expiresIn: eat,
        issuer: 'developershash.com',
      }

      jwt.sign(payload, secret, options, (err, token) => {
        if (err) {
          return reject(new Response(500, err))
        }
        return resolve(token)
      })
    })
  },
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err) return reject(new Response(401, err))

        const userId = payload.aud
        return resolve(userId)
      })
    })
  },
  jwt,
}
