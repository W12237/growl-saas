import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const client = await prisma.client.findUnique({
      where: { id }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Aggregate relational data across the system
    const projects = await prisma.project.findMany({
      where: { client: client.name },
      orderBy: { createdAt: 'desc' }
    });

    const invoices = await prisma.invoice.findMany({
      where: { client: client.name },
      orderBy: { date: 'desc' }
    });

    const meetings = await prisma.meeting.findMany({
      where: { client: client.name },
      orderBy: { createdAt: 'desc' }
    });
    
    // Calculate totals
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const outstandingRevenue = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);

    const clientData = {
      ...client,
      totalRevenue,
      outstandingRevenue,
      projects,
      invoices,
      meetings
    };

    return NextResponse.json(clientData);
  } catch (error) {
    console.error('Error fetching client details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
