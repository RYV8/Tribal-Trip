import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const mode = process.argv[2] || 'staging'
const isProduction = mode === 'production'
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
requireFile('Dockerfile')
requireFile('backend/Dockerfile')
requireFile('docker-compose.yml')
requireFile('deploy/docker.env.example')
requireFile('deploy/runtime-config.sh')
requireFile('deploy/README.md')
requireFile('public/runtime-config.js')
requireFile('public/service-worker.js')
requireFile('backend/.env.example')

requireIncludes('public/service-worker.js', "startsWith('/api/')", 'Service worker must not cache API responses.')
requireIncludes('public/service-worker.js', "startsWith('/uploads/')", 'Service worker must not cache uploaded media responses.')
requireIncludes('public/service-worker.js', "'/runtime-config.js'", 'Service worker must not cache runtime config.')
requireIncludes('deploy/runtime-config.sh', 'TRIBE_TRIP_API_URL', 'Runtime frontend API URL must be configurable at container startup.')
requireIncludes('backend/src/config/env.js', 'JWT_SECRET must be set to a unique value', 'Backend must reject weak production JWT secrets.')
requireIncludes('backend/src/config/env.js', 'DATABASE_URL must be set in production', 'Backend must require DATABASE_URL in production.')

if (existsSync('backend/prisma/schema.prisma')) {
  const schema = read('backend/prisma/schema.prisma')
  if (isProduction && schema.includes('provider = "sqlite"')) {
    failures.push('Production deploy is blocked while Prisma datasource provider is sqlite. Use a managed database and update backend/prisma/schema.prisma plus DATABASE_URL.')
  }
  if (!isProduction && schema.includes('provider = "sqlite"')) {
    warnings.push('Staging uses SQLite. This is acceptable for preview, not for market production.')
  }
}

warnIncludes('deploy/docker.env.example', 'JWT_SECRET=change_this_to_a_long_random_secret_string', 'deploy/docker.env.example contains a placeholder JWT_SECRET. Replace it in real environments.')
warnIncludes('backend/.env.example', 'JWT_SECRET=change_this_to_a_long_random_secret_string', 'backend/.env.example contains a placeholder JWT_SECRET. Replace it in real environments.')

const dockerConfigOk = runOptional('docker', ['compose', '--env-file', 'deploy/docker.env.example', 'config'])
if (!dockerConfigOk) warnings.push('Docker Compose config was not validated. Docker may be unavailable or the compose config may need attention.')

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
