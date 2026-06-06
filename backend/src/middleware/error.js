const { ApiError } = require('../utils/http')
const logger = require('../utils/logger')

function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found`, requestId: req.requestId })
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err)

  const statusCode = err instanceof ApiError || err.name === 'MulterError' ? err.statusCode || 400 : 500
  const message = statusCode === 500 ? 'Internal server error' : err.message

  if (statusCode === 500) {
    logger.write('error', 'request_error', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      error: logger.serializeError(err),
    })
  }
  const payload = { success: false, message, requestId: req.requestId }
  if (err.details) payload.details = err.details
  return res.status(statusCode).json(payload)
}

module.exports = { notFound, errorHandler }
