import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const amount = Number(searchParams.get('amount')) || 0;

    if (!code) {
      // If admin, return all coupons
      const user = await getAuthUser(req);
      if (user?.role === 'ADMIN') {
        const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json({ success: true, coupons });
      }
      return NextResponse.json({ error: 'Coupon code required' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }

    if (amount > 0 && amount < coupon.minOrderValue) {
      return NextResponse.json(
        { error: `Minimum order value for this coupon is ₹${coupon.minOrderValue}` },
        { status: 400 }
      );
    }

    let calculatedDiscount = 0;
    if (coupon.discountPercent && amount > 0) {
      calculatedDiscount = (amount * coupon.discountPercent) / 100;
      if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
        calculatedDiscount = coupon.maxDiscount;
      }
    } else if (coupon.fixedDiscount) {
      calculatedDiscount = coupon.fixedDiscount;
    }

    return NextResponse.json({
      success: true,
      coupon,
      calculatedDiscount: Math.round(calculatedDiscount),
    });
  } catch (error: any) {
    console.error('Coupon error:', error);
    return NextResponse.json({ error: error.message || 'Failed to check coupon' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { code, discountPercent, fixedDiscount, minOrderValue, maxDiscount, expiresAt } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const created = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        discountPercent: discountPercent ? Number(discountPercent) : null,
        fixedDiscount: fixedDiscount ? Number(fixedDiscount) : null,
        minOrderValue: Number(minOrderValue) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, coupon: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create coupon' }, { status: 500 });
  }
}
