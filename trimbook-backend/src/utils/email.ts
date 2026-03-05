// Uses Brevo (formerly Sendinblue) HTTP API — works on Render free tier, no domain needed
// Just verify your sender email address at brevo.com/senders

import fetch from 'node-fetch';

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const FROM_EMAIL = process.env.EMAIL_FROM_ADDRESS || 'noreply@trimbook.app';
const FROM_NAME = 'TrimBook';

const sendEmail = async (to: string, subject: string, html: string) => {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  const data = await res.json() as any;
  if (!res.ok) {
    throw new Error(data.message || `Brevo API error: ${res.status}`);
  }
  console.log('[TrimBook] Email sent via Brevo to:', to, '| MessageId:', data.messageId);
  return data;
};

export const sendVerificationEmail = async (to: string, code: string) => {
  await sendEmail(
    to,
    'Your TrimBook Verification Code',
    `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #ea580c; margin-bottom: 4px;">TrimBook</h2>
      <p style="color: #64748b; margin-top: 0;">Email Verification</p>
      <hr style="border-color: #f1f5f9;" />
      <p>Thank you for registering. Use the code below to verify your email address:</p>
      <div style="margin: 24px auto; padding: 16px 24px; font-size: 28px; font-weight: bold; background-color: #f1f5f9; width: fit-content; border-radius: 10px; letter-spacing: 6px; color: #1e293b;">
        ${code}
      </div>
      <p style="color: #64748b; font-size: 13px;">This code expires in <strong>10 minutes</strong>.</p>
    </div>
    `
  );
};

export const sendPasswordResetEmail = async (to: string, code: string) => {
  console.log('[TrimBook] Reset code (debug):', code);
  await sendEmail(
    to,
    'Reset Your TrimBook Password',
    `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #ea580c; margin-bottom: 4px;">TrimBook</h2>
      <p style="color: #64748b; margin-top: 0;">Password Reset Request</p>
      <hr style="border-color: #f1f5f9;" />
      <p>We received a request to reset your password. Use the code below to proceed:</p>
      <div style="margin: 24px auto; padding: 16px 24px; font-size: 28px; font-weight: bold; background-color: #fff7ed; border: 2px solid #ea580c; width: fit-content; border-radius: 10px; letter-spacing: 6px; color: #ea580c;">
        ${code}
      </div>
      <p style="color: #64748b; font-size: 13px;">This code expires in <strong>15 minutes</strong>.</p>
      <p style="color: #64748b; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
    `
  );
};

export const sendBookingConfirmationToClient = async (
  to: string,
  clientName: string,
  barberName: string,
  service: string,
  date: Date
) => {
  const formattedDate = date.toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  try {
    await sendEmail(
      to,
      `✅ Booking Confirmed – ${service} with ${barberName}`,
      `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #ea580c; margin-bottom: 4px;">TrimBook</h2>
        <p style="color: #64748b; margin-top: 0;">Appointment Confirmation</p>
        <hr style="border-color: #f1f5f9;"/>
        <p>Hi <strong>${clientName}</strong>,</p>
        <p>Your appointment has been successfully booked! Here are the details:</p>
        <table style="width: 100%; background: #f8fafc; border-radius: 8px; padding: 16px; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #64748b;">💇 Service</td><td style="padding: 6px 0; font-weight: bold;">${service}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">✂️ Barber</td><td style="padding: 6px 0; font-weight: bold;">${barberName}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">📅 Date & Time</td><td style="padding: 6px 0; font-weight: bold;">${formattedDate}</td></tr>
        </table>
        <p style="color: #64748b; font-size: 13px; margin-top: 20px;">Need to reschedule? Log in to your TrimBook dashboard.</p>
        <p style="color: #64748b; font-size: 13px;">See you soon! 💈</p>
      </div>
      `
    );
  } catch (err) {
    console.error('[TrimBook] Failed to send booking confirmation to client:', err);
  }
};

export const sendNewBookingAlertToBarber = async (
  to: string,
  barberName: string,
  clientName: string,
  service: string,
  date: Date
) => {
  const formattedDate = date.toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  try {
    await sendEmail(
      to,
      `📅 New Booking – ${clientName} booked ${service}`,
      `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #ea580c; margin-bottom: 4px;">TrimBook</h2>
        <p style="color: #64748b; margin-top: 0;">New Appointment Alert</p>
        <hr style="border-color: #f1f5f9;"/>
        <p>Hi <strong>${barberName}</strong>,</p>
        <p>You have a new booking! Here are the details:</p>
        <table style="width: 100%; background: #f8fafc; border-radius: 8px; padding: 16px; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #64748b;">👤 Client</td><td style="padding: 6px 0; font-weight: bold;">${clientName}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">💇 Service</td><td style="padding: 6px 0; font-weight: bold;">${service}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">📅 Date & Time</td><td style="padding: 6px 0; font-weight: bold;">${formattedDate}</td></tr>
        </table>
        <p style="color: #64748b; font-size: 13px; margin-top: 20px;">Log in to your TrimBook dashboard to manage your schedule.</p>
      </div>
      `
    );
  } catch (err) {
    console.error('[TrimBook] Failed to send booking alert to barber:', err);
  }
};
