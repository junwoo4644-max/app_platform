const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log('ADMIN_EMAIL/ADMIN_PASSWORD not set, skipping admin user seed.');
    return;
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Always force role=admin here, not just on first create -- this account
    // may have been created before the role column existed (defaulting to
    // "user"), and this keeps it correct on every redeploy either way.
    if (existing.role !== 'admin') {
      await prisma.user.update({ where: { email }, data: { role: 'admin' } });
      console.log(`Promoted existing user ${email} to admin.`);
    } else {
      console.log(`Admin user ${email} already exists, skipping.`);
    }
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, password: hash, role: 'admin' } });
  console.log(`Created admin user ${email}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
