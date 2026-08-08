import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isErrorResponse, logAudit } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: 'asc' }
    });

    const projects = await prisma.project.findMany();
    const invoices = await prisma.invoice.findMany();

    const enrichedClients = clients.map(client => {
      const clientProjects = projects.filter(p => p.client === client.name);
      const clientInvoices = invoices.filter(i => i.client === client.name && i.status === 'paid');

      return {
        ...client,
        projectCount: clientProjects.length,
        activeCampaigns: clientProjects.filter(p => p.status === 'active').length,
        totalRevenue: clientInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      };
    });

    return NextResponse.json(enrichedClients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { name, industry, contactPerson, email, phone, status, health, monthlyRetainer } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newClient = await prisma.client.create({
      data: {
        name,
        industry: industry || '',
        contactPerson: contactPerson || '',
        email: email || '',
        phone: phone || '',
        status: status || 'active',
        health: health || 'good',
        monthlyRetainer: monthlyRetainer ? parseFloat(monthlyRetainer) : 0,
      }
    });

    await logAudit(authUser.id, 'create', 'client', newClient.id, { name });
    return NextResponse.json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
