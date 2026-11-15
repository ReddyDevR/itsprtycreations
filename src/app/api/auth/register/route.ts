import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Check if phone already registered (if provided)
    if (phone) {
      const cleanPhone = phone.trim();
      const existingPhone = await prisma.user.findFirst({
        where: { phone: cleanPhone },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: 'An account with this mobile number already exists' },
          { status: 400 }
        );
      }
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : null,
        passwordHash,
        role: 'CUSTOMER',
        isVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'ADMIN',
      name: user.name,
    });

    const res = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user,
    });

    setAuthCookie(res, token);
    return res;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}
