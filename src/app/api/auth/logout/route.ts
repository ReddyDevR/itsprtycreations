import { NextRequest, NextResponse } from 'next/server';
import { sendSMS } from '../../../../lib/sms';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
  clearAuthCookie(res);
  return res;
}
