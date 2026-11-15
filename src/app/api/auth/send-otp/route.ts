import { NextRequest, NextResponse } from 'next/server';
import { generateNumericOtp, sendSmsOtp } from '@/lib/sms';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.trim().length < 10) {
      return NextResponse.json(
        { error: 'Valid 10-digit mobile number is required' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const otp = generateNumericOtp(6);

    const result = await sendSmsOtp(cleanPhone, otp);

    return NextResponse.json({
      success: true,
      message: result.message,
      phone: cleanPhone,
      // In dev or sandbox we return preview code for seamless testing
      previewOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
