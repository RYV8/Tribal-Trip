const bcrypt = require('bcryptjs')
const { prisma } = require('../src/config/db')

async function main() {
  const email = (process.env.DEV_EDITOR_EMAIL || 'editor@tribetrip.local').trim().toLowerCase()
  const password = process.env.DEV_EDITOR_PASSWORD || 'EditorPass123'
  const name = process.env.DEV_EDITOR_NAME || 'Tribe Trip Editor'
  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: 'editor', isActive: true },
    create: { name, email, passwordHash, role: 'editor', isActive: true },
  })

  console.log(`Dev editor ready: ${user.email}`)
  console.log(`Password: ${password}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
