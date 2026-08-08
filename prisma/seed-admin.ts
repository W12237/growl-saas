import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'wessam@grolw.cloud';
  const plainPassword = '123123@';
  
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });
  
  if (existingUser) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
        role: 'Admin',
        name: 'Wessam'
      }
    });
    console.log(`Updated admin user: ${adminEmail}`);
  } else {
    await prisma.user.create({
      data: {
        name: 'Wessam',
        email: adminEmail,
        password: hashedPassword,
        role: 'Admin',
        status: 'online',
        performance: 100,
      }
    });
    console.log(`Created admin user: ${adminEmail}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
