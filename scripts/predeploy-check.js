import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const mode = process.argv[2] || 'staging'
const isProduction = mode === 'production'
const isVercel = mode === 'vercel'
const failures = []
const warnings = []

function read(path) {
  return readFileSync(path, 'utf8')
}

function requireFile(path) {
  if (!existsSync(path)) failures.push(`Missing required file: ${path}`)
}

function requireIncludes(path, text, message) {
  if (!existsSync(path)) return
  if (!read(path).includes(text)) failures.push(message || `${path} must include ${text}`)
}

function warnIncludes(path, text, message) {
  if (!existsSync(path)) return
  if (read(path).includes(text)) warnings.push(message || `${path} includes ${text}`)
}

function runOptional(command, args) {
  try {
    execFileSync(command, args, { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

requireFile('.env.example')
requireFile('frontend-env/.env.example')
requireFile('Dockerfile')
requireFile('backend/Dockerfile')
requireFile('docker-compose.yml')
requireFile('deploy/docker.env.example')
requireFile('deploy/runtime-config.sh')
requireFile('deploy/README.md')
requireFile('public/runtime-config.js')
requireFile('public/service-worker.js')
requireFile('backend/.env.example')

if (isVercel) {
  requireFile('vercel.json')
  requireFile('api/[...path].js')
  requireFile('backend/prisma/schema.vercel.prisma')
}

requireIncludes('public/service-worker.js', "startsWith('/api/')", 'Service worker must not cache API responses.')
requireIncludes('public/service-worker.js', "startsWith('/uploads/')", 'Service worker must not cache uploaded media responses.')
requireIncludes('public/service-worker.js', "'/runtime-config.js'", 'Service worker must not cache runtime config.')
requireIncludes('deploy/runtime-config.sh', 'TRIBE_TRIP_API_URL', 'Runtime frontend API URL must be configurable at container startup.')
requireIncludes('backend/src/config/env.js', 'JWT_SECRET must be set to a unique value', 'Backend must reject weak production JWT secrets.')
requireIncludes('backend/src/config/env.js', 'DATABASE_URL must be set in production', 'Backend must require DATABASE_URL in production.')

if (isVercel) {
  requireIncludes('vercel.json', 'npm ci --include=dev', 'Vercel install must include frontend dev dependencies such as Vite.')
  requireIncludes('vercel.json', 'npm --prefix backend ci --include=dev', 'Vercel install must include backend dev dependencies such as Prisma CLI.')
  requireIncludes('vercel.json', 'npm run build:vercel', 'Vercel build must generate the backend Prisma client before building the frontend.')
  requireIncludes('vercel.json', 'api/[...path].js', 'Vercel config must include the catch-all API function settings.')
  requireIncludes('vite.config.js', "envDir: './frontend-env'", 'Vite must not load backend secrets from the root .env file.')
  requireIncludes('src/services/api.js', 'const DEFAULT_API_URL = import.meta.env.PROD', 'Production frontend must choose its default API URL by environment.')
  requireIncludes('src/services/api.js', '"/api"', 'Production frontend must default to same-origin /api for a single Vercel deployment.')
  requireIncludes('backend/src/config/env.js', 'POSTGRES_PRISMA_URL', 'Backend must support Vercel Postgres environment variable names.')
  requireIncludes('backend/src/config/env.js', 'MEDIA_STORAGE_PROVIDER=cloudinary or MEDIA_STORAGE_PROVIDER=supabase is required on Vercel', 'Backend must reject local media storage on Vercel.')
  requireIncludes('backend/src/config/env.js', 'SUPABASE_SERVICE_ROLE_KEY', 'Backend must validate Supabase Storage credentials when MEDIA_STORAGE_PROVIDER=supabase.')
  requireIncludes('backend/src/services/mediaStorage.js', 'provider: "supabase"', 'Media storage must support Supabase uploads for Vercel production.')
}

if (existsSync('backend/prisma/schema.prisma')) {
  const schema = read('backend/prisma/schema.prisma')
  if (isProduction && schema.includes('provider = "sqlite"')) {
    failures.push('Production deploy is blocked while Prisma datasource provider is sqlite. Use a managed database and update backend/prisma/schema.prisma plus DATABASE_URL.')
  }
  if (isVercel && schema.includes('provider = "sqlite"')) {
    warnings.push('Local development schema uses SQLite. Vercel deploy uses backend/prisma/schema.vercel.prisma with PostgreSQL.')
  }
  if (!isProduction && !isVercel && schema.includes('provider = "sqlite"')) {
    warnings.push('Staging uses SQLite. This is acceptable for preview, not for market production.')
  }
}

if (isVercel && existsSync('backend/prisma/schema.vercel.prisma')) {
  const vercelSchema = read('backend/prisma/schema.vercel.prisma')
  if (!vercelSchema.includes('provider = "postgresql"')) {
    failures.push('Vercel backend deploy requires backend/prisma/schema.vercel.prisma to use PostgreSQL.')
  }
}

warnIncludes('deploy/docker.env.example', 'JWT_SECRET=change_this_to_a_long_random_secret_string', 'deploy/docker.env.example contains a placeholder JWT_SECRET. Replace it in real environments.')
warnIncludes('backend/.env.example', 'JWT_SECRET=change_this_to_a_long_random_secret_string', 'backend/.env.example contains a placeholder JWT_SECRET. Replace it in real environments.')

if (!isVercel) {
  const dockerConfigOk = runOptional('docker', ['compose', '--env-file', 'deploy/docker.env.example', 'config'])
  if (!dockerConfigOk) warnings.push('Docker Compose config was not validated. Docker may be unavailable or the compose config may need attention.')
}

if (warnings.length) {
  console.log('Predeploy warnings:')
  for (const warning of warnings) console.log(`- ${warning}`)
}

if (failures.length) {
  console.error('Predeploy failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Predeploy ${mode} check passed.`)
