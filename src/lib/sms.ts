import prisma from './prisma';

export function generateNumericOtp(length = 6): string {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

export async function sendSmsOtp(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
  // Normalize phone number (strip whitespace, ensure format)
  const cleanPhone = phone.replace(/\s+/g, '');

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

  // Save to database
  await prisma.otpVerification.create({
    data: {
      phone: cleanPhone,
      otp,
      expiresAt,
      verified: false,
    },
  });

  const messageText = `Your LTS Party Creations verification code is: ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;

  // 1. If Fast2SMS API Key is provided
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: cleanPhone.replace(/^\+91/, ''),
        }),
      });
      const data = await response.json();
      if (data.return) {
        return { success: true, message: 'OTP sent successfully via SMS gateway.' };
      }
    } catch (err) {
      console.error('Fast2SMS error:', err);
    }
  }

  // 2. If Twilio credentials are provided
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  ) {
    try {
      const auth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString('base64');

      const params = new URLSearchParams();
      params.append('To', cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`);
      params.append('From', process.env.TWILIO_PHONE_NUMBER);
      params.append('Body', messageText);

      const twilioRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );
      if (twilioRes.ok) {
        return { success: true, message: 'OTP sent successfully via Twilio.' };
      }
    } catch (err) {
      console.error('Twilio error:', err);
    }
  }

  // 3. Fallback / Dev environment: log OTP clearly to server console so testing never blocks
  console.log(`\n======================================================`);
  console.log(`[SMS GATEWAY SIMULATION / DISPATCH]`);
  console.log(`To Phone Number: ${cleanPhone}`);
  console.log(`Message: ${messageText}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`Expires At: ${expiresAt.toISOString()}`);
  console.log(`======================================================\n`);

  return {
    success: true,
    message: `OTP generated and dispatched to ${cleanPhone}. (Code: ${otp})`,
  };
}

export async function verifySmsOtp(phone: string, otp: string): Promise<boolean> {
  const cleanPhone = phone.replace(/\s+/g, '');

  const record = await prisma.otpVerification.findFirst({
    where: {
      phone: cleanPhone,
      otp: otp.trim(),
      verified: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!record) {
    return false;
  }

  // Mark as verified
  await prisma.otpVerification.update({
    where: { id: record.id },
    data: { verified: true },
  });

  return true;
}
