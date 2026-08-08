import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isErrorResponse, logAudit } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { name, client, status, progress, priority, dueDate, team } = await req.json();

    if (!name || !client || !dueDate) {
      return NextResponse.json({ error: 'Name, client, and due date are required' }, { status: 400 });
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        client,
        status: status || 'planning',
        progress: progress ? parseInt(progress, 10) : 0,
        priority: priority || 'medium',
        dueDate: new Date(dueDate),
        team: team || '',
        createdById: authUser.id,
      }
    });

    await logAudit(authUser.id, 'create', 'project', newProject.id, { name, client });
    return NextResponse.json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
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

    await prisma.project.delete({ where: { id } });
    await logAudit(authUser.id, 'delete', 'project', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { id, status, progress } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (progress !== undefined) updateData.progress = parseInt(progress, 10);

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    await logAudit(authUser.id, 'update', 'project', id, { status, progress });
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
