const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const root = path.join(__dirname, '..')
const prismaBin = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'prisma.cmd' : 'prisma')
const env = {
  ...process.env,
  NODE_ENV: 'test',
  DATABASE_URL: process.env.TEST_DATABASE_URL || 'file:../test.db',
  JWT_SECRET: process.env.JWT_SECRET || 'test_secret_change_me',
  MEDIA_STORAGE_PROVIDER: 'local',
}

function run(command, args) {
  execFileSync(command, args, { cwd: root, env, stdio: 'inherit' })
}

try {
  run(prismaBin, ['generate'])
  run(prismaBin, ['db', 'push', '--force-reset'])
  run(process.execPath, ['--test', 'tests/*.test.js'])
} finally {
  for (const file of ['test.db', 'test.db-journal']) {
    fs.rmSync(path.join(root, file), { force: true })
  }
}
