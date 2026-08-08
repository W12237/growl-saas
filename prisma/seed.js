const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create current user
  const you = await prisma.user.upsert({
    where: { id: 'user-you' },
    update: {},
    create: {
      id: 'user-you',
      name: 'You',
      avatar: 'Y',
      status: 'online',
    },
  });

  // Create Gemini AI user
  const gemini = await prisma.user.upsert({
    where: { id: 'user-gemini' },
    update: {},
    create: {
      id: 'user-gemini',
      name: 'Gemini AI',
      avatar: 'G',
      status: 'online',
      isAI: true,
    },
  });

  // Create team members
  const mike = await prisma.user.upsert({
    where: { id: 'user-mike' },
    update: {},
    create: { id: 'user-mike', name: 'Mike Ross', avatar: 'MR', status: 'busy' },
  });
  
  const sarah = await prisma.user.upsert({
    where: { id: 'user-sarah' },
    update: {},
    create: { id: 'user-sarah', name: 'Sarah Jenkins', avatar: 'SJ', status: 'online' },
  });

  const elena = await prisma.user.upsert({
    where: { id: 'user-elena' },
    update: {},
    create: { id: 'user-elena', name: 'Elena Rodriguez', avatar: 'ER', status: 'offline' },
  });

  // Create Channels
  await prisma.channel.upsert({
    where: { id: 'general' },
    update: {},
    create: { id: 'general', name: 'general', type: 'channel' },
  });
  
  await prisma.channel.upsert({
    where: { id: 'marketing' },
    update: {},
    create: { id: 'marketing', name: 'marketing-team', type: 'channel', unread: 3 },
  });

  // Create Direct Messages
  await prisma.channel.upsert({
    where: { id: 'dm-gemini' },
    update: {},
    create: { id: 'dm-gemini', name: 'Gemini AI', type: 'dm', isAI: true },
  });

  await prisma.channel.upsert({
    where: { id: 'dm-sarah' },
    update: {},
    create: { id: 'dm-sarah', name: 'Sarah Jenkins', type: 'dm' },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
