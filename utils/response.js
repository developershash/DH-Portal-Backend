class Response {
  constructor(statusCode, message, payload) {
    this.statusCode = statusCode
    this.message = message
    this.payload = payload
  }

  generate() {
    const responseObject = {
      statusCode: this.statusCode,
      message: this.message,
    }
    if (this.payload) {
      responseObject.payload = this.payload
    }
    return responseObject
  }
}

module.exports = Response
