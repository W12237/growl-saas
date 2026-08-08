import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isErrorResponse, logAudit } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const automations = await prisma.automation.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, name: true } } }
    });
    return NextResponse.json(automations);
  } catch (error) {
    console.error('Error fetching automations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const { title, description, trigger, actions, status } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const automation = await prisma.automation.create({
      data: {
        title,
        description: description || null,
        trigger: trigger || null,
        actions: actions ? JSON.stringify(actions) : null,
        status: status || 'active',
        createdById: user.id,
      }
    });

    await logAudit(user.id, 'create', 'automation', automation.id, { title });

    return NextResponse.json(automation);
  } catch (error) {
    console.error('Error creating automation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const { id, status, title, description, trigger, actions } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (trigger !== undefined) updateData.trigger = trigger;
    if (actions !== undefined) updateData.actions = JSON.stringify(actions);

    // If toggling to active, increment run count
    if (status === 'active') {
      updateData.lastRunAt = new Date();
    }

    const updated = await prisma.automation.update({
      where: { id },
      data: updateData,
    });

    await logAudit(user.id, 'update', 'automation', id, { status });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating automation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.automation.delete({ where: { id } });
    await logAudit(user.id, 'delete', 'automation', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting automation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
