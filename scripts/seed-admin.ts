import bcrypt from 'bcryptjs'

// ============================================================
// Seed script — Create admin user
// Run: bun scripts/seed-admin.ts
// ============================================================

async function main() {
  // Dynamically import PrismaClient after pre-dev.js sets up the schema
  const { PrismaClient } = await import('@prisma/client')
  const db = new PrismaClient()

  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@huobao.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    const adminName = process.env.ADMIN_NAME || '管理员'

    // Check if admin already exists
    const existing = await db.user.findUnique({ where: { email: adminEmail } })
    if (existing) {
      console.log(`[seed] Admin user already exists: ${adminEmail}`)
      if (existing.role !== 'admin') {
        await db.user.update({
          where: { id: existing.id },
          data: { role: 'admin' },
        })
        console.log('[seed] Updated existing user to admin role')
      }
      return
    }

    // Create admin
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    const admin = await db.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: 'admin',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    console.log('[seed] Admin user created:')
    console.log(`  Email: ${admin.email}`)
    console.log(`  Name:  ${admin.name}`)
    console.log(`  Role:  ${admin.role}`)
    console.log(`  Password: ${adminPassword}`)
  } catch (err) {
    console.error('[seed] Error:', err)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

main()
