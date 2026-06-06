const crypto = require('node:crypto')
const env = require('../config/env')
const logger = require('../utils/logger')

function safeRequestId(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return /^[a-zA-Z0-9._:-]{8,128}$/.test(trimmed) ? trimmed : null
}

function requestContext(req, res, next) {
  const incomingId = safeRequestId(req.get('x-request-id'))
  req.requestId = incomingId || crypto.randomUUID()
  res.set('X-Request-Id', req.requestId)
  next()
}

function requestLogger(req, res, next) {
  if (!env.logRequests) return next()

  const startedAt = process.hrtime.bigint()
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000
    logger.write(res.statusCode >= 500 ? 'error' : 'info', 'http_request', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      userId: req.user?.id || null,
      ip: req.ip,
    })
  })

  next()
}

module.exports = { requestContext, requestLogger }
