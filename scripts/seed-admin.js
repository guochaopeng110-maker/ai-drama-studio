// ============================================================
// Seed script: Create default admin user
// Run: node scripts/seed-admin.js
// ============================================================

const bcrypt = require('bcryptjs')

async function main() {
  // Dynamically import PrismaClient
  const { PrismaClient } = require('@prisma/client')
  const db = new PrismaClient()

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@huobao.ai'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const adminName = process.env.ADMIN_NAME || '管理员'

  try {
    // Check if admin already exists
    const existing = await db.user.findUnique({ where: { email: adminEmail } })

    if (existing) {
      console.log(`[seed] Admin user already exists: ${adminEmail} (role: ${existing.role})`)

      // Upgrade to admin if not already
      if (existing.role !== 'admin') {
        await db.user.update({ where: { email: adminEmail }, data: { role: 'admin' } })
        console.log(`[seed] Upgraded ${adminEmail} to admin role`)
      }
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    const user = await db.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: 'admin',
      },
    })

    console.log(`[seed] Admin user created: ${user.email} (role: ${user.role})`)
    console.log(`[seed] Password: ${adminPassword}`)
    console.log(`[seed] ⚠️  Please change the password after first login!`)
  } catch (error) {
    console.error('[seed] Error:', error.message)
  } finally {
    await db.$disconnect()
  }
}

main()
