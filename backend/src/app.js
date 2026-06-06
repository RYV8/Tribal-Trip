const express = require('express')
const path = require('path')
const cors = require('cors')
const helmet = require('helmet')
const env = require('./config/env')
const { testConnection } = require('./config/db')
const { notFound, errorHandler } = require('./middleware/error')
const { requestContext, requestLogger } = require('./middleware/observability')
const { createRateLimit } = require('./middleware/rateLimit')

const app = express()

app.disable('x-powered-by')
app.set('trust proxy', env.trustProxy)
app.use(requestContext)
app.use(requestLogger)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.frontendUrls.includes(origin)) return callback(null, true)
    if (env.nodeEnv !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), { maxAge: '30d' }))

app.use('/api', createRateLimit({ max: env.rateLimits.apiMax }))

app.get('/api/live', (req, res) => {
  res.json({ success: true, service: 'Tribe Trip API', status: 'live', env: env.nodeEnv, requestId: req.requestId })
})

app.get(['/api/health', '/api/ready'], async (req, res) => {
  try {
    await testConnection()
    res.json({ success: true, service: 'Tribe Trip API', status: 'ready', database: 'ready', env: env.nodeEnv, requestId: req.requestId })
  } catch (err) {
    res.status(503).json({ success: false, service: 'Tribe Trip API', status: 'not_ready', database: 'unavailable', message: err.message, requestId: req.requestId })
  }
})

app.use('/api/auth', createRateLimit({ max: env.rateLimits.authMax, message: 'Too many authentication attempts' }), require('./routes/auth'))
app.use('/api/profile', require('./routes/profile'))
app.use('/api/countries', require('./routes/countries'))
app.use('/api/categories', require('./routes/categories'))
app.use('/api/locations', require('./routes/locations'))
app.use('/api/stories', require('./routes/stories'))
app.use('/api/artifacts', require('./routes/artifacts'))
app.use('/api/culture-guides', require('./routes/cultureGuides'))
app.use('/api/favorites', require('./routes/favorites'))
app.use('/api/local-secrets', createRateLimit({ max: env.rateLimits.localSecretsMax, message: 'Too many local secret requests' }), require('./routes/localSecrets'))
app.use('/api/map', require('./routes/map'))
app.use('/api/search', require('./routes/search'))
app.use('/api/admin', require('./routes/admin'))

app.use(notFound)
app.use(errorHandler)

module.exports = app
