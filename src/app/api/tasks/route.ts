import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isErrorResponse, requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const tasks = await prisma.task.findMany({
      include: {
        project: { select: { id: true, name: true, client: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true, role: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  // Only Admin or Member can assign tasks
  try {
    const { title, description, projectId, assigneeId, dueDate, priority = 'medium', status = 'todo' } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        projectId: projectId || null,
        assigneeId: assigneeId || null,
        createdById: user.id,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
      }
    });

    // Notify assigned team member if assigned
    if (assigneeId && assigneeId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          title: 'New Task Assigned',
          message: `${user.name} assigned you a new task: "${title.trim()}"`,
          type: 'info',
          link: '/dashboard/tasks',
        }
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'create_task',
        resource: 'task',
        resourceId: newTask.id,
        metadata: JSON.stringify({ title, projectId, assigneeId }),
      }
    });

    return NextResponse.json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const { id, status, priority, assigneeId, projectId, title, description, dueDate } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (projectId !== undefined) updateData.projectId = projectId;
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
      }
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const adminCheck = await requireRole(req, ['Admin']);
  if (isErrorResponse(adminCheck)) return adminCheck;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
