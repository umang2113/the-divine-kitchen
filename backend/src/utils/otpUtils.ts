import { transporter } from './emailUtils';

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (email: string, phone: string, otp: string) => {
  const message = `Your verification code for THE DIVINE is ${otp}`;
  
  // 1. Send Real Email
  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Don't await this, let it run in the background so it doesn't block the API
      transporter.sendMail({
        from: `"THE DIVINE" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'THE DIVINE - Verification Code',
        text: message,
        html: `
          <div style="font-family: serif; padding: 20px; background-color: #000; color: #fff; text-align: center; border: 1px solid #c5a059;">
            <h1 style="color: #c5a059;">THE DIVINE</h1>
            <p style="font-size: 18px; color: #ccc;">Your luxury dining experience awaits.</p>
            <div style="margin: 30px 0; padding: 20px; background-color: #1a1a1a; border: 1px dashed #c5a059;">
              <span style="font-size: 32px; letter-spacing: 10px; font-weight: bold; color: #c5a059;">${otp}</span>
            </div>
            <p style="color: #888; font-size: 12px;">This code will expire in 10 minutes.</p>
          </div>
        `,
      }).then(() => {
        console.log(`[REAL EMAIL] Sent successfully to ${email}`);
      }).catch((err) => {
        console.error(`[EMAIL ERROR] Failed to send to ${email} (Check your App Password):`, err);
      });
    } else {
      console.log(`[EMAIL SIMULATION] To: ${email} | OTP: ${otp} (Set EMAIL_USER & EMAIL_PASS in .env for real emails)`);
    }
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send to ${email}:`, error);
  }

  // 2. Simulated WhatsApp (Console only for now)
  console.log(`[WHATSAPP SIMULATION] To: ${phone} | OTP: ${otp}`);
};
