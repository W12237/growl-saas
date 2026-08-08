import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkUser() {
  const email = 'wessam@grolw.cloud';
  const password = '123123@';
  
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  console.log('User found:', user ? 'Yes' : 'No');
  
  if (user) {
    console.log('Password hash exists:', !!user.password);
    if (user.password) {
      const match = await bcrypt.compare(password, user.password);
      console.log('Password matches 123123@:', match);
    }
  }
}

checkUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
