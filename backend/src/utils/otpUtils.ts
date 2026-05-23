import { transporter } from './emailUtils';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (email: string, phone: string, otp: string) => {
  const message = `Your verification code for THE DIVINE is ${otp}`;
  
  const htmlContent = `
    <div style="font-family: serif; padding: 20px; background-color: #000; color: #fff; text-align: center; border: 1px solid #c5a059;">
      <h1 style="color: #c5a059;">THE DIVINE</h1>
      <p style="font-size: 18px; color: #ccc;">Your luxury dining experience awaits.</p>
      <div style="margin: 30px 0; padding: 20px; background-color: #1a1a1a; border: 1px dashed #c5a059;">
        <span style="font-size: 32px; letter-spacing: 10px; font-weight: bold; color: #c5a059;">${otp}</span>
      </div>
      <p style="color: #888; font-size: 12px;">This code will expire in 10 minutes.</p>
    </div>
  `;

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Primary: Use Nodemailer (Gmail) to ensure it sends to ALL email addresses
      transporter.sendMail({
        from: `"THE DIVINE" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'THE DIVINE - Verification Code',
        text: message,
        html: htmlContent,
      }).then(() => {
        console.log(`[REAL EMAIL] Sent successfully to ${email}`);
      }).catch((err) => {
        console.error(`[EMAIL ERROR] Failed to send to ${email}. SMTP blocked or wrong password.`);
        console.log(`[BACKUP OTP] Your OTP is: ${otp}`); 
      });
    } else if (process.env.RESEND_API_KEY) {
      // Fallback: Resend (Note: Free tier only sends to the verified owner's email)
      resend.emails.send({
        from: 'THE DIVINE <onboarding@resend.dev>',
        to: email,
        subject: 'THE DIVINE - Verification Code',
        html: htmlContent,
      }).then(() => {
        console.log(`[RESEND EMAIL] Sent successfully to ${email}`);
      }).catch((err) => {
        console.error(`[RESEND ERROR] Failed to send to ${email}:`, err);
        console.log(`[BACKUP OTP] Your OTP is: ${otp}`);
      });
    } else {
      console.log(`[EMAIL SIMULATION] To: ${email} | OTP: ${otp} (Configure EMAIL_USER in .env)`);
    }
  } catch (error) {
    console.error(`[CRITICAL EMAIL ERROR]:`, error);
  }

  // 2. Simulated WhatsApp (Console only for now)
  console.log(`[WHATSAPP SIMULATION] To: ${phone} | OTP: ${otp}`);
};
