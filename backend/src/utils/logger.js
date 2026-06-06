const env = require('../config/env')

function write(level, event, fields = {}) {
  const payload = {
    level,
    event,
    service: 'tribe-trip-api',
    env: env.nodeEnv,
    time: new Date().toISOString(),
    ...fields,
  }
  const line = JSON.stringify(payload)
  if (level === 'error') return console.error(line)
  if (level === 'warn') return console.warn(line)
  return console.log(line)
}

function serializeError(err) {
  return {
    name: err.name,
    message: err.message,
    stack: env.nodeEnv === 'production' ? undefined : err.stack,
  }
}

module.exports = { serializeError, write }
