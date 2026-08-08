const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database & seeding strictly user accounts...");

  try {
    // 1. Wipe non-user entities
    await prisma.message.deleteMany({});
    await prisma.channel.deleteMany({});
    await prisma.fileAsset.deleteMany({});
    await prisma.automation.deleteMany({});
    await prisma.approval.deleteMany({});
    await prisma.campaign.deleteMany({});
    await prisma.lead.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.report.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.meeting.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.contentPost.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.userPolicy.deleteMany({});
    await prisma.policy.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("All non-user data wiped successfully.");

    // 2. Create System Policies
    const defaultPolicies = [
      {
        name: 'Full Access',
        description: 'Complete access to all resources and actions. Assigned to Admin users.',
        permissions: JSON.stringify(['*']),
        isSystem: true,
      },
      {
        name: 'Standard Member',
        description: 'Read all resources, create and edit own resources.',
        permissions: JSON.stringify([
          'read:*',
          'create:project', 'create:lead', 'create:campaign', 'create:approval', 'create:content',
          'create:meeting', 'create:report', 'create:automation', 'create:file',
          'update:own', 'delete:own'
        ]),
        isSystem: true,
      },
      {
        name: 'Viewer',
        description: 'Read-only access to all resources.',
        permissions: JSON.stringify(['read:*']),
        isSystem: true,
      },
    ];

    for (const p of defaultPolicies) {
      await prisma.policy.create({ data: p });
    }

    const fullAccessPolicy = await prisma.policy.findUnique({ where: { name: 'Full Access' } });
    const standardPolicy = await prisma.policy.findUnique({ where: { name: 'Standard Member' } });

    // 3. Create Authentic Team Users
    const teamMembers = [
      {
        name: 'Wessam',
        email: 'wessam@growl.cloud',
        password: '@123123',
        role: 'Admin',
        title: 'Founder & CEO',
        department: 'Management',
      },
      {
        name: 'Mohamed Rabeia',
        email: 'mohamed.rabeia@growl.cloud',
        password: '@123123',
        role: 'Member',
        title: 'Project Manager',
        department: 'Operations',
      },
      {
        name: 'Mena',
        email: 'mena@growl.cloud',
        password: '@123123',
        role: 'Member',
        title: 'Creative Director',
        department: 'Creative',
      },
      {
        name: 'Ziad',
        email: 'ziad@growl.cloud',
        password: '@123123',
        role: 'Member',
        title: 'Developer',
        department: 'Engineering',
      },
      {
        name: 'Renad',
        email: 'renad@growl.cloud',
        password: '@123123',
        role: 'Member',
        title: 'Marketing Specialist',
        department: 'Marketing',
      },
      {
        name: 'Mohamed El Bishbishi',
        email: 'bishbishi@growl.cloud',
        password: '@123123',
        role: 'Member',
        title: 'Account Manager',
        department: 'Client Services',
      },
    ];

    for (const member of teamMembers) {
      const hashedPassword = await bcrypt.hash(member.password, 10);
      const user = await prisma.user.create({
        data: {
          name: member.name,
          email: member.email,
          password: hashedPassword,
          role: member.role,
          title: member.title,
          department: member.department,
          status: 'online',
          performance: 100,
        },
      });

      const policyToAssign = member.role === 'Admin' ? fullAccessPolicy : standardPolicy;
      if (policyToAssign) {
        await prisma.userPolicy.create({
          data: {
            userId: user.id,
            policyId: policyToAssign.id,
          },
        });
      }
    }

    console.log("Seeded 6 authentic users and system policies!");
  } catch (error) {
    console.error("Error cleaning/seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
