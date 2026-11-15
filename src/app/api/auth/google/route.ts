import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { credential, email, name, picture, googleId } = await req.json();

    let targetEmail = email;
    let targetName = name || 'Google Customer';
    let targetGoogleId = googleId;
    let targetAvatar = picture;

    // If an id_token was sent from Google Sign-In SDK, decode payload
    if (credential) {
      try {
        const payloadBase64 = credential.split('.')[1];
        const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
        targetEmail = decoded.email;
        targetName = decoded.name || targetName;
        targetGoogleId = decoded.sub;
        targetAvatar = decoded.picture || targetAvatar;
      } catch (e) {
        console.warn('Could not decode Google credential payload, using provided fields');
      }
    }

    if (!targetEmail) {
      return NextResponse.json(
        { error: 'Valid Google email is required' },
        { status: 400 }
      );
    }

    const cleanEmail = targetEmail.toLowerCase().trim();

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          ...(targetGoogleId ? [{ googleId: targetGoogleId }] : []),
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: targetName,
          email: cleanEmail,
          googleId: targetGoogleId,
          avatarUrl: targetAvatar,
          role: 'CUSTOMER',
          isVerified: true,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: targetGoogleId || user.googleId,
          avatarUrl: targetAvatar || user.avatarUrl,
          isVerified: true,
        },
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
      message: 'Signed in with Google successfully',
      user: userResponse,
    });

    setAuthCookie(res, token);
    return res;
  } catch (error: any) {
    console.error('Google login error:', error);
    return NextResponse.json(
      { error: error.message || 'Google authentication failed' },
      { status: 500 }
    );
  }
}
