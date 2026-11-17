import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '../../../../lib/prisma';
import { getStripe } from '../../../../lib/stripe';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook is not configured.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error: any) {
    console.error('Stripe webhook signature error:', error.message);
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === 'paid') {
      const orderId = session.metadata?.orderId || session.client_reference_id;
      if (orderId) {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (order && order.paymentStatus !== 'PAID' && session.currency === 'gbp' && session.amount_total === Math.round(order.totalAmount * 100)) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
              payments: { create: {
                paymentGateway: 'STRIPE',
                transactionId: typeof session.payment_intent === 'string' ? session.payment_intent : session.id,
                amount: order.totalAmount,
                currency: 'GBP',
                status: 'SUCCESS',
                rawResponse: JSON.stringify({ stripeSessionId: session.id, eventId: event.id }),
              } },
            },
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
