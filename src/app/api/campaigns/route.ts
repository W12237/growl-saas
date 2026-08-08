import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isErrorResponse, logAudit } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { name, client, platform, status, budget, spend, conversions, roi } = await req.json();

    if (!name || !platform) {
      return NextResponse.json({ error: 'Name and platform are required' }, { status: 400 });
    }

    const newCampaign = await prisma.campaign.create({
      data: {
        name,
        client: client || null,
        platform,
        status: status || 'draft',
        budget: budget ? parseFloat(budget) : 0,
        spend: spend ? parseFloat(spend) : 0,
        conversions: conversions ? parseInt(conversions, 10) : 0,
        roi: roi || null,
        createdById: authUser.id,
      }
    });

    await logAudit(authUser.id, 'create', 'campaign', newCampaign.id, { name });
    return NextResponse.json(newCampaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { id, ...data } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data
    });

    await logAudit(authUser.id, 'update', 'campaign', id);
    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
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

    await prisma.campaign.delete({ where: { id } });
    await logAudit(authUser.id, 'delete', 'campaign', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
