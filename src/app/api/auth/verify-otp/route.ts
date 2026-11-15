import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifySmsOtp } from '../../../../lib/sms';
import { signToken, setAuthCookie } from '../../../../lib/auth';
export async function POST(req: NextRequest) {
  try {
    const { phone, otp, name } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Mobile number and OTP code are required' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const isValid = await verifySmsOtp(cleanPhone, otp);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP. Please check and try again.' },
        { status: 400 }
      );
    }

    // Look for existing user by phone
    let user = await prisma.user.findFirst({
      where: { phone: cleanPhone },
    });

    if (!user) {
      // Create new customer account with phone
      const fallbackEmail = `customer_${cleanPhone.replace(/[^\d]/g, '').slice(-10)}@itsprtycreations.com`;
      user = await prisma.user.create({
        data: {
          name: name ? name.trim() : `Customer ${cleanPhone.slice(-4)}`,
          phone: cleanPhone,
          email: fallbackEmail,
          role: 'CUSTOMER',
          isVerified: true,
        },
      });
    } else if (!user.isVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'ADMIN',
      name: user.name,
    });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };

    const res = NextResponse.json({
      success: true,
      message: 'Mobile OTP verified successfully',
      user: userResponse,
    });

    setAuthCookie(res, token);
    return res;
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: error.message || 'OTP verification failed' },
      { status: 500 }
    );
  }
}
