import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isErrorResponse, logAudit } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const approvals = await prisma.approval.findMany({
      orderBy: { createdAt: 'desc' },
      include: { submitter: { select: { id: true, name: true } } }
    });
    return NextResponse.json(approvals);
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { title, type, client } = await req.json();

    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    }

    const newApproval = await prisma.approval.create({
      data: {
        title,
        type,
        submitterId: authUser.id,
        client: client || null,
        status: 'pending'
      }
    });

    await logAudit(authUser.id, 'create', 'approval', newApproval.id, { title });
    return NextResponse.json(newApproval);
  } catch (error) {
    console.error('Error creating approval:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const updatedApproval = await prisma.approval.update({
      where: { id },
      data: { status }
    });

    await logAudit(authUser.id, 'update', 'approval', id, { status });
    return NextResponse.json(updatedApproval);
  } catch (error) {
    console.error('Error updating approval:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.approval.delete({ where: { id } });
    await logAudit(authUser.id, 'delete', 'approval', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting approval:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
