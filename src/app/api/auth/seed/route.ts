import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // ── Team Members ──
    const teamMembers = [
      {
        name: 'Wessam',
        email: 'wessam@grolw.cloud',
        password: '123123@',
        role: 'Admin',
        title: 'Founder & CEO',
        department: 'Management',
      },
      {
        name: 'Mohamed Rabeia',
        email: 'mohamed.rabeia@grolw.cloud',
        password: 'Rabeia@2026',
        role: 'Member',
        title: 'Project Manager',
        department: 'Operations',
      },
      {
        name: 'Mena',
        email: 'mena@grolw.cloud',
        password: 'Mena@2026',
        role: 'Member',
        title: 'Creative Director',
        department: 'Creative',
      },
      {
        name: 'Ziad',
        email: 'ziad@grolw.cloud',
        password: 'Ziad@2026',
        role: 'Member',
        title: 'Developer',
        department: 'Engineering',
      },
      {
        name: 'Renad',
        email: 'renad@grolw.cloud',
        password: 'Renad@2026',
        role: 'Member',
        title: 'Marketing Specialist',
        department: 'Marketing',
      },
      {
        name: 'Mohamed El Bishbishi',
        email: 'bishbishi@grolw.cloud',
        password: 'Bishbishi@2026',
        role: 'Member',
        title: 'Account Manager',
        department: 'Client Services',
      },
    ];

    // ── Create System Policies ──
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
      const existing = await prisma.policy.findUnique({ where: { name: p.name } });
      if (!existing) {
        await prisma.policy.create({ data: p });
      }
    }

    // ── Create or Update Each Team Member ──
    const createdUsers: string[] = [];

    for (const member of teamMembers) {
      const hashedPassword = await bcrypt.hash(member.password, 10);

      const existingUser = await prisma.user.findUnique({
        where: { email: member.email },
      });

      let user;
      if (existingUser) {
        user = await prisma.user.update({
          where: { email: member.email },
          data: {
            name: member.name,
            password: hashedPassword,
            role: member.role,
            title: member.title,
            department: member.department,
            status: 'online',
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            name: member.name,
            email: member.email,
            password: hashedPassword,
            role: member.role,
            title: member.title,
            department: member.department,
            status: 'offline',
            performance: 100,
          },
        });
      }

      // Assign the correct policy based on role
      const policyName = member.role === 'Admin' ? 'Full Access' : 'Standard Member';
      const policy = await prisma.policy.findUnique({ where: { name: policyName } });
      if (policy) {
        const existingAssignment = await prisma.userPolicy.findUnique({
          where: { userId_policyId: { userId: user.id, policyId: policy.id } },
        });
        if (!existingAssignment) {
          await prisma.userPolicy.create({
            data: { userId: user.id, policyId: policy.id },
          });
        }
      }

      createdUsers.push(`${member.name} (${member.email})`);
    }

    // ── Create Default Channels ──
    const defaultChannels = [
      { id: 'general', name: 'general', type: 'channel' },
      { id: 'projects', name: 'projects', type: 'channel' },
      { id: 'random', name: 'random', type: 'channel' },
    ];

    for (const ch of defaultChannels) {
      const existing = await prisma.channel.findUnique({ where: { id: ch.id } });
      if (!existing) {
        await prisma.channel.create({ data: ch });
      }
    }

    // ── Log the seed action ──
    const adminUser = await prisma.user.findUnique({ where: { email: 'wessam@grolw.cloud' } });
    if (adminUser) {
      await prisma.auditLog.create({
        data: {
          userId: adminUser.id,
          action: 'seed',
          resource: 'system',
          metadata: JSON.stringify({ message: 'System seeded with team and policies', users: createdUsers }),
        },
      });
    }

    return NextResponse.json({
      message: 'System seeded successfully',
      users: createdUsers,
      policies: defaultPolicies.map(p => p.name),
    });
  } catch (error) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}
