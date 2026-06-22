const { PrismaClient } = require('@prisma/client')
const path = require('node:path')
const env = require('./env')

function isSqliteUrl(databaseUrl) {
  return typeof databaseUrl === 'string' && databaseUrl.startsWith('file:')
}

function resolveSqliteUrl(databaseUrl) {
  if (!databaseUrl || !databaseUrl.startsWith('file:')) return databaseUrl
  const sqlitePath = databaseUrl.slice('file:'.length)
  if (sqlitePath === ':memory:' || path.isAbsolute(sqlitePath)) return databaseUrl

  const schemaDir = path.join(__dirname, '..', '..', 'prisma')
  return `file:${path.resolve(schemaDir, sqlitePath)}`
}

function createPrismaClient() {
  // Prefer the sqlite adapter only for a file: URL; if initialization fails,
  // fall back to using the datasource URL to avoid adapter/schema mismatch.
  if (isSqliteUrl(env.databaseUrl)) {
    try {
      const { PrismaBetterSQLite3 } = require('@prisma/adapter-better-sqlite3')
      return new PrismaClient({ adapter: new PrismaBetterSQLite3({ url: resolveSqliteUrl(env.databaseUrl) }), errorFormat: 'colorless' })
    } catch (e) {
      console.warn('Prisma sqlite adapter init failed, falling back to datasource URL:', e && e.message)
    }
  }

  return new PrismaClient({ datasources: { db: { url: env.databaseUrl || undefined } }, errorFormat: 'colorless' })
}

const prisma = createPrismaClient()

async function testConnection() {
  let runtime = { database: isSqliteUrl(env.databaseUrl) ? 'sqlite' : null }
  if (!isSqliteUrl(env.databaseUrl)) {
    ;[runtime] = await prisma.$queryRaw`
      SELECT
        current_database() AS database,
        current_schema() AS schema,
        current_user AS username,
        inet_server_addr()::text AS host,
        inet_server_port() AS port
    `
  }
  const countryCount = await prisma.country.count()
  return { runtime, counts: { countries: countryCount } }
}

module.exports = { prisma, testConnection }
