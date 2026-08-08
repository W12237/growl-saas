import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole, isErrorResponse, logAudit } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const team = await prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        title: true,
        status: true,
        performance: true,
        avatar: true,
        isAI: true,
        lastActiveAt: true,
        createdAt: true,
        userPolicies: {
          include: { policy: { select: { id: true, name: true } } }
        }
      }
    });
    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = await requireRole(req, ['Admin']);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { name, email, role, department, title, status, performance, password, policyIds } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const newMember = await prisma.user.create({
      data: {
        name,
        email: email || null,
        password: hashedPassword,
        role: role || 'Member',
        department: department || '',
        title: title || '',
        status: status || 'offline',
        performance: performance !== undefined ? parseInt(performance, 10) : 100,
      }
    });

    if (policyIds && Array.isArray(policyIds) && policyIds.length > 0) {
      for (const policyId of policyIds) {
        await prisma.userPolicy.create({
          data: {
            userId: newMember.id,
            policyId
          }
        });
      }
    } else {
      // Auto-assign the appropriate policy based on role if no specific policies provided
      const policyName = role === 'Admin' ? 'Full Access' : role === 'Viewer' ? 'Viewer' : 'Standard Member';
      const policy = await prisma.policy.findUnique({ where: { name: policyName } });
      if (policy) {
        await prisma.userPolicy.create({
          data: { userId: newMember.id, policyId: policy.id }
        });
      }
    }

    await logAudit(authUser.id, 'create', 'user', newMember.id, { name, role });
    return NextResponse.json(newMember);
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authUser = await requireRole(req, ['Admin']);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { id, status, role, department, title, performance, password, policyIds } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (title !== undefined) updateData.title = title;
    if (performance !== undefined) updateData.performance = parseInt(performance, 10);

    // Password reset
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedMember = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Bulk policy assignment: clear existing and assign new set
    if (policyIds !== undefined && Array.isArray(policyIds)) {
      // Remove all existing policies for this user
      await prisma.userPolicy.deleteMany({ where: { userId: id } });
      // Assign new policies
      for (const policyId of policyIds) {
        await prisma.userPolicy.create({
          data: { userId: id, policyId },
        });
      }
    }

    await logAudit(authUser.id, 'update', 'user', id, updateData);

    // Return updated user with policies
    const fullUser = await prisma.user.findUnique({
      where: { id },
      include: {
        userPolicies: {
          include: { policy: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json(fullUser);
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authUser = await requireRole(req, ['Admin']);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Prevent deleting yourself
    if (id === authUser.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    await logAudit(authUser.id, 'delete', 'user', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
