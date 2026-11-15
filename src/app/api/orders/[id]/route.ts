import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    const { id } = params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check authorization: Admin or the owner of the order
    if (user?.role !== 'ADMIN' && order.userId && order.userId !== user?.id) {
      return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('Fetch order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { status, paymentStatus, trackingNumber, trackingUrl, notes } = body;

    const existing = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        status: status !== undefined ? status : existing.status,
        paymentStatus: paymentStatus !== undefined ? paymentStatus : existing.paymentStatus,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : existing.trackingNumber,
        trackingUrl: trackingUrl !== undefined ? trackingUrl : existing.trackingUrl,
        notes: notes !== undefined ? notes : existing.notes,
      },
      include: {
        items: true,
        payments: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: updated,
    });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
