import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isErrorResponse, logAudit } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { client, amount, status, date, dueDate } = await req.json();

    if (!client || !amount || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a simple Invoice ID (e.g., INV-2024-XXXX)
    const count = await prisma.invoice.count();
    const invoiceId = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceId,
        client,
        amount: parseFloat(amount),
        status: status || 'pending',
        date: date ? new Date(date) : new Date(),
        dueDate: new Date(dueDate),
      }
    });

    await logAudit(authUser.id, 'create', 'invoice', newInvoice.id, { client, amount });
    return NextResponse.json(newInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
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

    await prisma.invoice.delete({ where: { id } });
    await logAudit(authUser.id, 'delete', 'invoice', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
