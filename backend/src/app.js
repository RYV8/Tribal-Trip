import express from 'express'
import path from 'path'
import cors from 'cors'
import helmet from 'helmet'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

import env from './config/env.js'
import { testConnection } from './config/db.js'
import { notFound, errorHandler } from './middleware/error.js'
import { requestContext, requestLogger } from './middleware/observability.js'
import { createRateLimit } from './middleware/rateLimit.js'

// ES module workaround for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Route imports
import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import countriesRoutes from './routes/countries.js'
import categoriesRoutes from './routes/categories.js'
import locationsRoutes from './routes/locations.js'
import storiesRoutes from './routes/stories.js'
import artifactsRoutes from './routes/artifacts.js'
import cultureGuidesRoutes from './routes/cultureGuides.js'
import favoritesRoutes from './routes/favorites.js'
import localSecretsRoutes from './routes/localSecrets.js'
import mapRoutes from './routes/map.js'
import searchRoutes from './routes/search.js'
import adminRoutes from './routes/admin.js'

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

export default app
