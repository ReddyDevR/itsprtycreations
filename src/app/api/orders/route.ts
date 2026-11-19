import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getAuthUser } from '../../../lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Number(searchParams.get('limit')) || 50;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const where: any = {};

    // Customer only sees their orders, Admin can see all
    if (user.role !== 'ADMIN') {
      where.userId = user.id;
    } else {
      if (status && status !== 'ALL') {
        where.status = status;
      }
      if (search) {
        where.OR = [
          { orderNumber: { contains: search } },
          { customerName: { contains: search } },
          { customerEmail: { contains: search } },
          { customerPhone: { contains: search } },
        ];
      }
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        items: true,
        payments: true,
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      couponCode,
      paymentMethod, // STRIPE or COD
      notes,
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required order fields or empty items' },
        { status: 400 }
      );
    }

    // Calculate subtotal from database prices to prevent tampering
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { images: { where: { isPrimary: true }, take: 1 } },
      });

      if (!product) {
  return NextResponse.json(
    { error: `Product not found: ${item.productId}` },
    { status: 400 }
  );
}

// Prevent purchasing unavailable products
if (!product.isInStock) {
  return NextResponse.json(
    {
      error: `${product.title} is currently Out of Stock. Please remove it from your cart.`,
    },
    { status: 409 }
  );
}

let itemPrice = product.sellingPrice;
      if (item.variationPriceAdjustment) {
        itemPrice += Number(item.variationPriceAdjustment);
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      subtotal += itemPrice * qty;

      orderItemsData.push({
        productId: product.id,
        title: product.title,
        price: itemPrice,
        quantity: qty,
        variation: item.variation || null,
        personalization: item.personalization || null,
        image: product.images[0]?.url || null,
      });
    }

    // Apply Coupon if valid
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (coupon && coupon.isActive) {
        if (subtotal >= coupon.minOrderValue) {
          if (coupon.discountPercent) {
            let disc = (subtotal * coupon.discountPercent) / 100;
            if (coupon.maxDiscount && disc > coupon.maxDiscount) {
              disc = coupon.maxDiscount;
            }
            discountAmount = Math.round(disc);
          } else if (coupon.fixedDiscount) {
            discountAmount = coupon.fixedDiscount;
          }
        }
      }
    }

    // UK shipping calculation (free over £50, otherwise £4.99)
    const shippingAmount = subtotal - discountAmount >= 50 ? 0 : 4.99;
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);

    const orderNumber = `LTS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    if (!['STRIPE', 'COD'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Please select Stripe online payment or Cash on Delivery.' }, { status: 400 });
    }

    // Save order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user ? user.id : null,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        status: 'PENDING',
        totalAmount,
        subtotal,
        discountAmount,
        shippingAmount,
        paymentStatus: 'PENDING',
        paymentMethod,
        shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
        notes: notes || null,
        items: {
          create: orderItemsData,
        },
        ...(paymentMethod === 'COD' ? {
          payments: {
            create: {
              paymentGateway: 'COD',
              amount: totalAmount,
              currency: 'GBP',
              status: 'PENDING',
              rawResponse: JSON.stringify({ method: 'Cash on Delivery' }),
            },
          },
        } : {}),
      },
      include: {
        items: true,
      },
    });

    // Clear cart for the user or session
    if (user) {
      await prisma.cartItem.deleteMany({ where: { userId: user.id } });
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}
