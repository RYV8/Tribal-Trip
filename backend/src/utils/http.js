class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message)
    this.statusCode = statusCode
    this.details = details
  }
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

function sendOk(res, data, meta = {}) {
  res.json({ success: true, data, ...meta })
}

function sendCreated(res, data) {
  res.status(201).json({ success: true, data })
}

module.exports = { ApiError, asyncHandler, sendOk, sendCreated }
