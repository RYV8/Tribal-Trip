require('dotenv').config()

const nodeEnv = process.env.NODE_ENV || 'development'
const jwtSecret = process.env.JWT_SECRET || 'dev_only_change_this_secret'
const mediaStorageProvider = process.env.MEDIA_STORAGE_PROVIDER || 'local'
const databaseUrl = process.env.DATABASE_URL || (nodeEnv === 'production' ? '' : process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || 'file:../dev.db')
const isVercel = process.env.VERCEL === '1'

if (nodeEnv === 'production' && (!jwtSecret || jwtSecret === 'dev_only_change_this_secret' || jwtSecret === 'change_this_to_a_long_random_secret_string' || jwtSecret.length < 32)) {
  throw new Error('JWT_SECRET must be set to a unique value with at least 32 characters in production')
}

if (nodeEnv === 'production' && !databaseUrl) {
  throw new Error('DATABASE_URL must be set in production')
}

if (!['local', 'cloudinary', 'supabase'].includes(mediaStorageProvider)) {
  throw new Error('MEDIA_STORAGE_PROVIDER must be local, cloudinary, or supabase')
}

if (mediaStorageProvider === 'cloudinary') {
  for (const key of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) {
    if (!process.env[key]) throw new Error(`${key} must be set when MEDIA_STORAGE_PROVIDER=cloudinary`)
  }
}

if (mediaStorageProvider === 'supabase') {
  for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_STORAGE_BUCKET']) {
    if (!process.env[key]) throw new Error(`${key} must be set when MEDIA_STORAGE_PROVIDER=supabase`)
  }
}

if (isVercel && mediaStorageProvider === 'local') {
  throw new Error('MEDIA_STORAGE_PROVIDER=cloudinary or MEDIA_STORAGE_PROVIDER=supabase is required on Vercel because serverless file storage is ephemeral')
}

function parseList(value, fallback) {
  return (value || fallback)
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)
}

function normalizeOrigin(value) {
  const origin = String(value || '').trim().replace(/\/+$/, '')
  if (!origin) return ''
  return /^[a-z][a-z\d+.-]*:\/\//i.test(origin) ? origin : `https://${origin}`
}

function resolveFrontendUrls() {
  const defaultFrontendUrls = nodeEnv === 'production' ? '' : 'http://localhost:5173,http://127.0.0.1:5173'
  const configuredUrls = parseList(process.env.FRONTEND_URLS || process.env.FRONTEND_URL, defaultFrontendUrls)
  const vercelUrls = parseList(
    [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean).join(','),
    '',
  )

  return Array.from(new Set([...configuredUrls, ...vercelUrls]))
}

function parsePositiveInt(value, fallback) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === '') return fallback
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase())
}

function parseTrustProxy(value) {
  if (value === undefined || value === '') return false
  const normalized = String(value).toLowerCase()
  if (['false', '0', 'off', 'no'].includes(normalized)) return false
  if (['true', 'on', 'yes'].includes(normalized)) return 1
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : value
}

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv,
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  frontendUrls: resolveFrontendUrls(),
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl,
  logRequests: parseBoolean(process.env.LOG_REQUESTS, nodeEnv === 'production'),
  rateLimits: {
    windowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
    apiMax: parsePositiveInt(process.env.RATE_LIMIT_API_MAX, 500),
    authMax: parsePositiveInt(process.env.RATE_LIMIT_AUTH_MAX, 30),
    localSecretsMax: parsePositiveInt(process.env.RATE_LIMIT_LOCAL_SECRETS_MAX, 60),
  },
  mediaStorageProvider,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'tribe-trip',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'tribe-trip-media',
  },
}

module.exports = env
