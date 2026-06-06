const bcrypt = require('bcryptjs')
const { prisma } = require('../src/config/db')

async function main() {
  const email = (process.env.DEV_SUPER_ADMIN_EMAIL || 'superadmin@tribetrip.local').trim().toLowerCase()
  const password = process.env.DEV_SUPER_ADMIN_PASSWORD || 'SuperAdminPass123'
  const name = process.env.DEV_SUPER_ADMIN_NAME || 'Tribe Trip Super Admin'
  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: 'super_admin', isActive: true },
    create: { name, email, passwordHash, role: 'super_admin', isActive: true },
  })

  console.log(`Dev super admin ready: ${user.email}`)
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
