const { PrismaClient } = require('@prisma/client')
const path = require('node:path')
const { PrismaBetterSQLite3 } = require('@prisma/adapter-better-sqlite3')
const env = require('./env')

function resolveSqliteUrl(databaseUrl) {
  if (!databaseUrl.startsWith('file:')) return databaseUrl
  const sqlitePath = databaseUrl.slice('file:'.length)
  if (sqlitePath === ':memory:' || path.isAbsolute(sqlitePath)) return databaseUrl

  const schemaDir = path.join(__dirname, '..', '..', 'prisma')
  return `file:${path.resolve(schemaDir, sqlitePath)}`
}

const adapter = new PrismaBetterSQLite3({ url: resolveSqliteUrl(env.databaseUrl) })
const prisma = new PrismaClient({ adapter, errorFormat: 'colorless' })

async function testConnection() {
  await prisma.$queryRaw`SELECT 1`
  return true
}

module.exports = { prisma, testConnection }
