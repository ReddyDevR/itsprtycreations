import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, verifyPassword, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Admin email and password are required' },
        { status: 400 }
      );
    }

    const configuredEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const configuredPassword = process.env.ADMIN_PASSWORD;

    if (!configuredEmail || !configuredPassword || configuredPassword.length < 12) {
      return NextResponse.json(
        { error: 'Admin credentials are not configured correctly on the server' },
        { status: 500 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    if (cleanEmail !== configuredEmail || String(password) !== configuredPassword) {
      return NextResponse.json(
        { error: 'Access denied: Invalid administrator credentials' },
        { status: 403 }
      );
    }

    let user = await prisma.user.findUnique({ where: { email: configuredEmail } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: process.env.ADMIN_NAME?.trim() || 'Administrator',
          email: configuredEmail,
          passwordHash: await hashPassword(configuredPassword),
          role: 'ADMIN',
          isVerified: true,
        },
      });
    } else if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Configured admin email belongs to a non-admin account. Contact support.' },
        { status: 403 }
      );
    } else if (!user.passwordHash || !(await verifyPassword(configuredPassword, user.passwordHash))) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hashPassword(configuredPassword) },
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: 'ADMIN',
      name: user.name,
    });

    const res = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'ADMIN',
        avatarUrl: user.avatarUrl,
      },
      redirect: '/admin',
    });

    setAuthCookie(res, token);
    return res;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: error.message || 'Admin authentication failed' },
      { status: 500 }
    );
  }
}
