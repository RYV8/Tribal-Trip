const { rateLimit } = require('express-rate-limit')
const env = require('../config/env')

function createRateLimit({ windowMs = env.rateLimits.windowMs, max = 120, message = 'Too many requests' } = {}) {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, message },
  })
}

module.exports = { createRateLimit }
