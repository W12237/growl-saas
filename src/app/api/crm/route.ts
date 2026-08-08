import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isErrorResponse, logAudit } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { company, contactPerson, email, value, probability, stage, assignedTo } = await req.json();

    if (!company || !contactPerson) {
      return NextResponse.json({ error: 'Company and Contact Person are required' }, { status: 400 });
    }

    const newLead = await prisma.lead.create({
      data: {
        company,
        contactPerson,
        email: email || null,
        value: value ? parseFloat(value) : 0,
        probability: probability ? parseInt(probability, 10) : 10,
        stage: stage || 'lead',
        assignedToId: assignedTo || null
      }
    });

    await logAudit(authUser.id, 'create', 'lead', newLead.id, { company });
    return NextResponse.json(newLead);
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { id, stage } = await req.json();

    if (!id || !stage) {
      return NextResponse.json({ error: 'ID and Stage are required' }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { stage }
    });

    // CRM Automation: If moved to "client" (Won), automatically create a Project
    if (stage === 'client' && lead.stage !== 'client') {
      try {
        await prisma.project.create({
          data: {
            name: `${lead.company} Onboarding`,
            client: lead.company,
            status: 'planning',
            progress: 0,
            priority: 'medium',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            team: lead.assignedToId || 'Unassigned',
            createdById: authUser.id,
          }
        });
        
        await prisma.transaction.create({
          data: {
            desc: `Initial Retainer: ${lead.company}`,
            type: 'income',
            amount: lead.value > 0 ? lead.value : 5000,
            category: 'Sales',
          }
        });

        await logAudit(authUser.id, 'auto_create', 'project', null, { reason: 'deal_won', company: lead.company });
      } catch (automationError) {
        console.error('Automation failed:', automationError);
      }
    }

    await logAudit(authUser.id, 'update', 'lead', id, { stage });
    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Error updating lead:', error);
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

    await prisma.lead.delete({ where: { id } });
    await logAudit(authUser.id, 'delete', 'lead', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
