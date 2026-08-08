import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isErrorResponse, logAudit } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder');

    const where: any = {};
    if (folder && folder !== 'all') {
      where.type = folder; // image, video, document, archive
    }

    const files = await prisma.fileAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { id: true, name: true } } }
    });
    return NextResponse.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    const { name, type, size, folder, url } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    const file = await prisma.fileAsset.create({
      data: {
        name,
        type: type || 'document',
        size: size || 0,
        folder: folder || 'all',
        url: url || null,
        uploadedById: user.id,
      }
    });

    await logAudit(user.id, 'create', 'file', file.id, { name, type });

    return NextResponse.json(file);
  } catch (error) {
    console.error('Error creating file:', error);
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

    await prisma.fileAsset.delete({ where: { id } });
    await logAudit(user.id, 'delete', 'file', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
