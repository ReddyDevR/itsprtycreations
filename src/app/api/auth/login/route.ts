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
    // 1. ADMIN AUTHENTICATION FROM ENV
    // =====================================

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME?.trim() || 'Administrator';

    if (adminEmail && email === adminEmail) {

      if (!adminPassword || adminPassword.length < 12) {
        return NextResponse.json(
          { error: 'Admin credentials are not configured correctly on the server' },
          { status: 500 }
        );
      }

      if (password !== adminPassword) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      let admin = await prisma.user.findUnique({
        where: { email: adminEmail },
      });

      if (admin && admin.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Administrator email conflicts with an existing customer account' },
          { status: 403 }
        );
      }

      if (!admin) {
        admin = await prisma.user.create({
          data: {
            name: adminName,
            email: adminEmail,
            passwordHash: await hashPassword(adminPassword),
            role: 'ADMIN',
            isVerified: true,
          },
        });
      } else {
        admin = await prisma.user.update({
          where: { id: admin.id },
          data: {
            name: adminName,
            passwordHash: await hashPassword(adminPassword),
            isVerified: true,
          },
        });
      }

      const adminToken = signToken({
        userId: admin.id,
        email: admin.email,
        role: 'ADMIN',
        name: admin.name,
      });

      const response = NextResponse.json({
        success: true,
        message: 'Administrator login successful',
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: 'ADMIN',
          avatarUrl: admin.avatarUrl,
        },
      });

      setAuthCookie(response, adminToken);

      return response;
    }

    // =====================================
    // 2. CUSTOMER AUTHENTICATION
    // =====================================

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(
      password,
      user.passwordHash
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: 'CUSTOMER',
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: 'CUSTOMER',
        avatarUrl: user.avatarUrl,
      },
    });

    setAuthCookie(response, token);

    return response;

  } catch (error: any) {
    console.error('Login error:', error);

    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
