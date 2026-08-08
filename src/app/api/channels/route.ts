import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isErrorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const channels = await prisma.channel.findMany({
      orderBy: { name: 'asc' },
    });

    const users = await prisma.user.findMany({
      where: {
        id: { not: user.id } // Don't return current user in DM list
      }
    });

    // Map the users to the directMessages format for the frontend
    // In a real app we would have a separate DM model or a user-to-user relation
    // but for simplicity we treat users as DM targets
    const dms = users.map(user => ({
      id: user.id,
      name: user.name,
      status: user.status,
      unread: 0,
      isAI: user.isAI,
      avatar: user.avatar
    }));

    return NextResponse.json({ 
      channels: channels.filter(c => c.type === 'channel'), 
      directMessages: dms
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
