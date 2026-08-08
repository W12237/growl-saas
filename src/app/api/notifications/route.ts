import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isErrorResponse, logAudit } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const body = await req.json();
    const { id } = body;

    if (id) {
      const updated = await prisma.notification.update({
        where: { id, userId: user.id },
        data: { read: true }
      });
      return NextResponse.json(updated);
    } else {
      // Mark all as read
      const updated = await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true }
      });
      return NextResponse.json({ success: true, count: updated.count });
    }
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const { title, message, type, link, targetUserId } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId || user.id,
        title,
        message,
        type: type || 'info',
        link: link || null,
      }
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
