const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { password: { not: null } } });
  for (const user of users) {
    const isMatch = await bcrypt.compare('@123123', user.password);
    console.log(`- ${user.email} -> password matches '@123123': ${isMatch}`);
  }
}

main().finally(() => prisma.$disconnect());
