import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getStripe } from '../../../../lib/stripe';
import { getAuthUser } from '../../../../lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: String(orderId) }, include: { items: true } });
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    const user = await getAuthUser(req);
    if (order.userId && (!user || (user.id !== order.userId && user.role !== 'ADMIN'))) {
      return NextResponse.json({ error: 'You are not allowed to pay for this order.' }, { status: 403 });
    }
    if (order.paymentMethod !== 'STRIPE') return NextResponse.json({ error: 'This order is not configured for Stripe payment.' }, { status: 400 });
    if (order.paymentStatus === 'PAID') return NextResponse.json({ error: 'This order is already paid.' }, { status: 409 });

    const stripe = getStripe();
    const origin = new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'en-GB',
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer_email: order.customerEmail,
      client_reference_id: order.id,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'gbp',
          unit_amount: Math.round(order.totalAmount * 100),
          product_data: {
            name: `Order ${order.orderNumber}`,
            description: `${order.items.length} item(s) from ITSPRTYCREATIONS`,
          },
        },
      }],
      success_url: `${origin}/checkout?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?payment=cancelled&order_id=${encodeURIComponent(order.id)}`,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout session error:', error);
    return NextResponse.json({ error: error.message || 'Unable to start Stripe checkout.' }, { status: 500 });
  }
}
