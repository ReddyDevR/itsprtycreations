import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '../../../../lib/razorpay';
import prisma from '../../../../lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { orderId, amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const receipt = orderId || `rcpt_${Date.now()}`;
    const razorpayOrder = await createRazorpayOrder({
      amount: Number(amount),
      receipt,
    });

    if (orderId) {
      await prisma.order.updateMany({
        where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
        data: { razorpayOrderId: razorpayOrder.id },
      });
    }

    return NextResponse.json({
      success: true,
      razorpayOrder,
    });
  } catch (error: any) {
    console.error('Payment order creation error:', error);
    return NextResponse.json({ error: error.message || 'Payment initiation failed' }, { status: 500 });
  }
}
