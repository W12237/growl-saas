import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, isErrorResponse, logAudit } from '@/lib/auth';

// GET: List all policies (Admin only)
export async function GET(req: NextRequest) {
  const user = await requireRole(req, ['Admin']);
  if (isErrorResponse(user)) return user;

  try {
    const policies = await prisma.policy.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        userPolicies: {
          include: { user: { select: { id: true, name: true, email: true } } }
        }
      }
    });
    return NextResponse.json(policies);
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new policy (Admin only)
export async function POST(req: NextRequest) {
  const user = await requireRole(req, ['Admin']);
  if (isErrorResponse(user)) return user;

  try {
    const { name, description, permissions } = await req.json();

    if (!name || !permissions) {
      return NextResponse.json({ error: 'Name and permissions are required' }, { status: 400 });
    }

    const policy = await prisma.policy.create({
      data: {
        name,
        description: description || null,
        permissions: JSON.stringify(permissions),
      }
    });

    await logAudit(user.id, 'create', 'policy', policy.id, { name });

    return NextResponse.json(policy);
  } catch (error) {
    console.error('Error creating policy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Assign or remove a policy from a user (Admin only)
export async function PATCH(req: NextRequest) {
  const user = await requireRole(req, ['Admin']);
  if (isErrorResponse(user)) return user;

  try {
    const { userId, policyId, action } = await req.json();

    if (!userId || !policyId || !action) {
      return NextResponse.json({ error: 'userId, policyId, and action are required' }, { status: 400 });
    }

    if (action === 'assign') {
      const existing = await prisma.userPolicy.findUnique({
        where: { userId_policyId: { userId, policyId } }
      });
      if (!existing) {
        await prisma.userPolicy.create({
          data: { userId, policyId }
        });
      }
      await logAudit(user.id, 'assign_policy', 'user', userId, { policyId });
    } else if (action === 'remove') {
      await prisma.userPolicy.deleteMany({
        where: { userId, policyId }
      });
      await logAudit(user.id, 'remove_policy', 'user', userId, { policyId });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error managing policy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete a policy (Admin only, non-system policies)
export async function DELETE(req: NextRequest) {
  const user = await requireRole(req, ['Admin']);
  if (isErrorResponse(user)) return user;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const policy = await prisma.policy.findUnique({ where: { id } });
    if (policy?.isSystem) {
      return NextResponse.json({ error: 'Cannot delete system policies' }, { status: 403 });
    }

    await prisma.userPolicy.deleteMany({ where: { policyId: id } });
    await prisma.policy.delete({ where: { id } });
    await logAudit(user.id, 'delete', 'policy', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting policy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
