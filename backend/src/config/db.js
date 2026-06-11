const { PrismaClient } = require('@prisma/client')
const path = require('node:path')
const env = require('./env')

function isSqliteUrl(databaseUrl) {
  return databaseUrl.startsWith('file:')
}

function resolveSqliteUrl(databaseUrl) {
  if (!databaseUrl.startsWith('file:')) return databaseUrl
  const sqlitePath = databaseUrl.slice('file:'.length)
  if (sqlitePath === ':memory:' || path.isAbsolute(sqlitePath)) return databaseUrl

  const schemaDir = path.join(__dirname, '..', '..', 'prisma')
  return `file:${path.resolve(schemaDir, sqlitePath)}`
}

function createPrismaClient() {
  if (isSqliteUrl(env.databaseUrl)) {
    const { PrismaBetterSQLite3 } = require('@prisma/adapter-better-sqlite3')
    return new PrismaClient({ adapter: new PrismaBetterSQLite3({ url: resolveSqliteUrl(env.databaseUrl) }), errorFormat: 'colorless' })
  }

  return new PrismaClient({ datasources: { db: { url: env.databaseUrl } }, errorFormat: 'colorless' })
}

const prisma = createPrismaClient()

async function testConnection() {
  await prisma.$queryRaw`SELECT 1`
  return true
}

module.exports = { prisma, testConnection }
