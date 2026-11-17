import { NextRequest, NextResponse } from 'next/server';

import prisma from '../../../../lib/prisma';

import {
  hashPassword,
  signToken,
  setAuthCookie,
} from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = String(body.name || '').trim();
    const email = String(body.email || '').toLowerCase().trim();
    const phone = body.phone ? String(body.phone).trim() : null;
    const password = String(body.password || '');

    // =====================================
    // 1. REQUIRED FIELD VALIDATION
    // =====================================

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // =====================================
    // 2. NAME VALIDATION
    // =====================================

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        { error: 'Name must contain between 2 and 80 characters' },
        { status: 400 }
      );
    }

    // =====================================
    // 3. EMAIL VALIDATION
    // =====================================

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // =====================================
    // 4. PASSWORD VALIDATION
    // =====================================

    if (password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { error: 'Password must contain between 8 and 128 characters' },
        { status: 400 }
      );
    }

    // =====================================
    // 5. ADMIN EMAIL PROTECTION
    // =====================================

    const adminEmail = process.env.ADMIN_EMAIL
      ?.toLowerCase()
      .trim();

    if (adminEmail && email === adminEmail) {
      return NextResponse.json(
        {
          error: 'This email is reserved for administrator access',
        },
        { status: 403 }
      );
    }

    // =====================================
    // 6. CHECK EXISTING EMAIL
    // =====================================

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'An account with this email already exists',
        },
        { status: 400 }
      );
    }

    // =====================================
    // 7. PHONE VALIDATION
    // =====================================

    if (phone) {
      if (phone.length < 10 || phone.length > 15) {
        return NextResponse.json(
          {
            error: 'Please enter a valid mobile number',
          },
          { status: 400 }
        );
      }

      const existingPhone = await prisma.user.findFirst({
        where: {
          phone,
        },
      });

      if (existingPhone) {
        return NextResponse.json(
          {
            error: 'An account with this mobile number already exists',
          },
          { status: 400 }
        );
      }
    }

    // =====================================
    // 8. HASH PASSWORD
    // =====================================

    const passwordHash = await hashPassword(password);

    // =====================================
    // 9. CREATE CUSTOMER ACCOUNT
    // =====================================

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
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

    // =====================================
    // 10. GENERATE AUTHENTICATION TOKEN
    // =====================================

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: 'CUSTOMER',
      name: user.name,
    });

    // =====================================
    // 11. SUCCESS RESPONSE
    // =====================================

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user,
      },
      {
        status: 201,
      }
    );

    setAuthCookie(response, token);

    return response;

  } catch (error: any) {
    console.error('Registration error:', error);

    return NextResponse.json(
      {
        error: 'Failed to create account. Please try again.',
      },
      {
        status: 500,
      }
    );
  }
}
