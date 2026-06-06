const bcrypt = require('bcryptjs')
const { prisma } = require('../src/config/db')

async function main() {
  const email = (process.env.DEV_ADMIN_EMAIL || 'admin@tribetrip.local').trim().toLowerCase()
  const password = process.env.DEV_ADMIN_PASSWORD || 'AdminPass123'
  const name = process.env.DEV_ADMIN_NAME || 'Tribe Trip Admin'
  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: 'admin', isActive: true },
    create: { name, email, passwordHash, role: 'admin', isActive: true },
  })

  console.log(`Dev admin ready: ${user.email}`)
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
