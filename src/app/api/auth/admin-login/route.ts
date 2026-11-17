import { NextRequest, NextResponse } from 'next/server';

import prisma from '../../../../lib/prisma';

import {
  hashPassword,
  verifyPassword,
  signToken,
  setAuthCookie,
} from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    // =====================================
    // 1. READ LOGIN DETAILS
    // =====================================

    const body = await req.json();

    const email = String(body.email || '').toLowerCase().trim();
    const password = String(body.password || '');

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // =====================================
    // 2. GET ADMIN CREDENTIALS FROM ENV
    // =====================================

    const configuredEmail = process.env.ADMIN_EMAIL
      ?.toLowerCase()
      .trim();

    const configuredPassword = process.env.ADMIN_PASSWORD;

    const adminName =
      process.env.ADMIN_NAME?.trim() || 'Administrator';

    if (
      !configuredEmail ||
      !configuredPassword ||
      configuredPassword.length < 12
    ) {
      console.error('Admin environment variables are missing or invalid');

      return NextResponse.json(
        {
          error: 'Admin credentials are not configured correctly on the server',
        },
        { status: 500 }
      );
    }

    // =====================================
    // 3. VERIFY ADMIN CREDENTIALS
    // =====================================

    if (
      email !== configuredEmail ||
      password !== configuredPassword
    ) {
      return NextResponse.json(
        {
          error: 'Invalid administrator email or password',
        },
        { status: 401 }
      );
    }

    // =====================================
    // 4. FIND ADMIN ACCOUNT
    // =====================================

    let user = await prisma.user.findUnique({
      where: {
        email: configuredEmail,
      },
    });

    // =====================================
    // 5. CREATE ADMIN IF NOT EXISTS
    // =====================================

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: adminName,
          email: configuredEmail,
          passwordHash: await hashPassword(configuredPassword),
          role: 'ADMIN',
          isVerified: true,
        },
      });
    }

    // =====================================
    // 6. VERIFY EXISTING ACCOUNT ROLE
    // =====================================

    else if (user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Configured admin email belongs to a customer account. Contact support.',
        },
        { status: 403 }
      );
    }

    // =====================================
    // 7. SYNCHRONIZE ADMIN PASSWORD HASH
    // =====================================

    else if (
      !user.passwordHash ||
      !(await verifyPassword(configuredPassword, user.passwordHash))
    ) {
      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: adminName,
          passwordHash: await hashPassword(configuredPassword),
          isVerified: true,
        },
      });
    }

    // =====================================
    // 8. GENERATE JWT TOKEN
    // =====================================

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: 'ADMIN',
      name: user.name,
    });

    // =====================================
    // 9. LOGIN SUCCESS RESPONSE
    // =====================================

    const response = NextResponse.json(
      {
        success: true,
        message: 'Administrator login successful',

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: 'ADMIN',
          avatarUrl: user.avatarUrl,
        },

        redirect: '/admin',
      },
      {
        status: 200,
      }
    );

    // =====================================
    // 10. SET SECURE AUTHENTICATION COOKIE
    // =====================================

    setAuthCookie(response, token);

    return response;

  } catch (error: any) {
    console.error('Admin login error:', error);

    return NextResponse.json(
      {
        error: 'Administrator authentication failed. Please try again.',
      },
      {
        status: 500,
      }
    );
  }
}
