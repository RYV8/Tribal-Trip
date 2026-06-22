const express = require('express')
const path = require('path')
const cors = require('cors')
const helmet = require('helmet')

const env = require('./config/env.js')
const { testConnection } = require('./config/db.js')
const { notFound, errorHandler } = require('./middleware/error.js')
const { requestContext, requestLogger } = require('./middleware/observability.js')
const { createRateLimit } = require('./middleware/rateLimit.js')

// Route imports
const authRoutes = require('./routes/auth.js')
const profileRoutes = require('./routes/profile.js')
const countriesRoutes = require('./routes/countries.js')
const categoriesRoutes = require('./routes/categories.js')
const locationsRoutes = require('./routes/locations.js')
const storiesRoutes = require('./routes/stories.js')
const artifactsRoutes = require('./routes/artifacts.js')
const cultureGuidesRoutes = require('./routes/cultureGuides.js')
const favoritesRoutes = require('./routes/favorites.js')
const localSecretsRoutes = require('./routes/localSecrets.js')
const mapRoutes = require('./routes/map.js')
const searchRoutes = require('./routes/search.js')
const adminRoutes = require('./routes/admin.js')

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
    const diagnostics = await testConnection()
    res.json({
      success: true,
      service: 'Tribe Trip API',
      status: 'ready',
      database: 'ready',
      env: env.nodeEnv,
      databaseTarget: env.databaseTarget,
      databaseRuntime: diagnostics.runtime,
      counts: diagnostics.counts,
      requestId: req.requestId,
    })
  } catch (err) {
    res.status(503).json({
      success: false,
      service: 'Tribe Trip API',
      status: 'not_ready',
      database: 'unavailable',
      env: env.nodeEnv,
      databaseTarget: env.databaseTarget,
      message: err.message,
      requestId: req.requestId,
    })
  }
})

app.use('/api/auth', createRateLimit({ max: env.rateLimits.authMax, message: 'Too many authentication attempts' }), authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/countries', countriesRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/locations', locationsRoutes)
app.use('/api/stories', storiesRoutes)
app.use('/api/artifacts', artifactsRoutes)
app.use('/api/culture-guides', cultureGuidesRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/local-secrets', createRateLimit({ max: env.rateLimits.localSecretsMax, message: 'Too many local secret requests' }), localSecretsRoutes)
app.use('/api/map', mapRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
