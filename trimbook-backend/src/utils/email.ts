import nodemailer from 'nodemailer';

const createTransporter = () => {
  const port = Number(process.env.EMAIL_PORT) || 587;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port,
    secure: port === 465,
    family: 4, // Force IPv4 to avoid ENETUNREACH on IPv6-disabled networks
    connectionTimeout: 10000,  // 10s to establish connection
    greetingTimeout: 8000,     // 8s to get SMTP greeting
    socketTimeout: 15000,      // 15s of socket inactivity
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  } as any);
};

export const sendVerificationEmail = async (to: string, code: string) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: '"TrimBook Auth" <noreply@trimbook.com>',
      to,
      subject: 'Your TrimBook Verification Code',
      text: `Your verification code is: ${code}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #ea580c;">TrimBook</h2>
          <p>Thank you for registering. Please use the following 6-digit code to verify your email address:</p>
          <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background-color: #f1f5f9; width: fit-content; border-radius: 8px; letter-spacing: 4px;">
            ${code}
          </div>
          <p style="color: #64748b; font-size: 14px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info as any));
    return nodemailer.getTestMessageUrl(info as any);
  } catch (error) {
    console.error('Email send error:', error);
  }
};

export const sendPasswordResetEmail = async (to: string, code: string) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: '"TrimBook Auth" <noreply@trimbook.com>',
    to,
    subject: 'Reset Your TrimBook Password',
    text: `Your password reset code is: ${code}. It expires in 15 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #ea580c; margin-bottom: 4px;">TrimBook</h2>
        <p style="color: #64748b; margin-top: 0;">Password Reset Request</p>
        <hr style="border-color: #f1f5f9;" />
        <p>We received a request to reset your password. Use the code below to proceed:</p>
        <div style="margin: 24px auto; padding: 16px 24px; font-size: 28px; font-weight: bold; background-color: #fff7ed; border: 2px solid #ea580c; width: fit-content; border-radius: 10px; letter-spacing: 6px; color: #ea580c;">
          ${code}
        </div>
        <p style="color: #64748b; font-size: 13px;">This code expires in <strong>15 minutes</strong>.</p>
        <p style="color: #64748b; font-size: 13px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
  console.log('[TrimBook] Password reset email sent to:', to);
  console.log('[TrimBook] Reset code (debug):', code);
  console.log('[TrimBook] Preview URL:', nodemailer.getTestMessageUrl(info as any));
};


export const sendBookingConfirmationToClient = async (
  to: string,
  clientName: string,
  barberName: string,
  service: string,
  date: Date
) => {
  try {
    const transporter = createTransporter();
    const formattedDate = date.toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    await transporter.sendMail({
      from: '"TrimBook" <noreply@trimbook.com>',
      to,
      subject: `✅ Booking Confirmed – ${service} with ${barberName}`,
      html: `
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
      `,
    });
    console.log('Booking confirmation sent to client:', to);
  } catch (error) {
    console.error('Error sending booking confirmation to client:', error);
  }
};

export const sendNewBookingAlertToBarber = async (
  to: string,
  barberName: string,
  clientName: string,
  service: string,
  date: Date
) => {
  try {
    const transporter = createTransporter();
    const formattedDate = date.toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    await transporter.sendMail({
      from: '"TrimBook" <noreply@trimbook.com>',
      to,
      subject: `📅 New Booking – ${clientName} booked ${service}`,
      html: `
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
      `,
    });
    console.log('New booking alert sent to barber:', to);
  } catch (error) {
    console.error('Error sending booking alert to barber:', error);
  }
};
