import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getAuthUser } from '../../../lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const sessionId = req.cookies.get('cart_session')?.value;

    if (!user && !sessionId) {
      return NextResponse.json({ success: true, items: [] });
    }

    const where: any = {};
    if (user) {
      where.userId = user.id;
    } else {
      where.sessionId = sessionId;
    }

    const items = await prisma.cartItem.findMany({
      where,
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error: any) {
    console.error('Fetch cart error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    let sessionId = req.cookies.get('cart_session')?.value;
    let setSessionCookie = false;

    if (!user && !sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setSessionCookie = true;
    }

    const { productId, quantity, variationId, personalization } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const qty = Math.max(1, Number(quantity) || 1);

// Verify product availability
const product = await prisma.product.findUnique({
  where: { id: productId },
});

if (!product) {
  return NextResponse.json(
    { error: 'Product not found.' },
    { status: 404 }
  );
}

if (!product.isInStock) {
  return NextResponse.json(
    { error: 'Sorry! This product is Out of Stock.' },
    { status: 409 }
  );
}

// Check if item already in cart
const existing = await prisma.cartItem.findFirst({
      where: {
        productId,
        userId: user ? user.id : null,
        sessionId: !user ? sessionId : null,
        variationId: variationId || null,
        personalization: personalization || null,
      },
    });

    let item;
    if (existing) {
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + qty,
        },
        include: { product: true },
      });
    } else {
      item = await prisma.cartItem.create({
        data: {
          productId,
          userId: user ? user.id : null,
          sessionId: !user ? sessionId : null,
          quantity: qty,
          variationId: variationId || null,
          personalization: personalization || null,
        },
        include: { product: true },
      });
    }

    const res = NextResponse.json({
      success: true,
      message: 'Item added to cart',
      item,
    });

    if (setSessionCookie && sessionId) {
      res.cookies.set('cart_session', sessionId, {
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return res;
  } catch (error: any) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add item to cart' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, quantity } = await req.json();

    if (!id || quantity === undefined) {
      return NextResponse.json({ error: 'Item ID and quantity required' }, { status: 400 });
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      await prisma.cartItem.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Item removed from cart' });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity: qty },
      include: { product: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Cart updated',
      item: updated,
    });
  } catch (error: any) {
    console.error('Update cart error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error: any) {
    console.error('Delete cart item error:', error);
    return NextResponse.json({ error: error.message || 'Failed to remove item' }, { status: 500 });
  }
}
