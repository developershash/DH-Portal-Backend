class Response {
  constructor(statusCode, message, data) {
    this.statusCode = statusCode
    this.message = message
    this.data = data
  }

  generate(statusCode, message, data) {
    const responseObject = {
      statusCode: statusCode || this.statusCode,
      message: message || this.message,
    }
    if (data || this.data) {
      responseObject.data = data || this.data
    }
    return responseObject
  }
}

module.exports = Response
