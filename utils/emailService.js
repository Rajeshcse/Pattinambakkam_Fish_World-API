import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  // For development, you can use ethereal.email or mailtrap.io
  // For production, use actual SMTP credentials (Gmail, SendGrid, AWS SES, etc.)

  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // Development - Log to console instead of sending real emails
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'test@test.com',
        pass: process.env.SMTP_PASSWORD || 'test',
      },
    });
  }
};

// Send email verification OTP
export const sendVerificationEmail = async (email, otp, name) => {
  try {
    console.log('sendVerificationEmail called with:', { email, otp, name });

    // In development, just log to console instead of sending real email
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n========================================');
      console.log('📧 EMAIL VERIFICATION OTP (DEV MODE)');
      console.log('========================================');
      console.log('To:', email);
      console.log('Name:', name);
      console.log('OTP:', otp);
      console.log('Expires in: 10 minutes');
      console.log('========================================\n');

      return { success: true, messageId: 'dev-mode-' + Date.now() };
    }

    // Production: Send actual email
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Pattinambakkam_Fish_World'}" <${process.env.FROM_EMAIL || 'noreply@Pattinambakkam_Fish_World.com'}>`,
      to: email,
      subject: 'Email Verification - Pattinambakkam_Fish_World',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hi ${name},</h2>
          <p>Thank you for registering with Pattinambakkam_Fish_World! Please verify your email address.</p>
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4CAF50; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't create an account with Pattinambakkam_Fish_World, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">This is an automated email, please do not reply.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    console.error('Error stack:', error.stack);
    return { success: false, error: error.message };
  }
};

// Send password reset OTP
export const sendPasswordResetEmail = async (email, otp, name) => {
  try {
    // In development, just log to console instead of sending real email
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n========================================');
      console.log('🔐 PASSWORD RESET OTP (DEV MODE)');
      console.log('========================================');
      console.log('To:', email);
      console.log('Name:', name);
      console.log('OTP:', otp);
      console.log('Expires in: 10 minutes');
      console.log('========================================\n');

      return { success: true, messageId: 'dev-mode-' + Date.now() };
    }

    // Production: Send actual email
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Pattinambakkam_Fish_World'}" <${process.env.FROM_EMAIL || 'noreply@Pattinambakkam_Fish_World.com'}>`,
      to: email,
      subject: 'Password Reset Request - Pattinambakkam_Fish_World',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hi ${name},</h2>
          <p>You requested to reset your password. Use the OTP below to reset your password:</p>
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #FF5722; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p><strong>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">This is an automated email, please do not reply.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after successful verification
export const sendWelcomeEmail = async (email, name) => {
  try {
    // In development, just log to console instead of sending real email
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n========================================');
      console.log('🎉 WELCOME EMAIL (DEV MODE)');
      console.log('========================================');
      console.log('To:', email);
      console.log('Name:', name);
      console.log('Message: Email verified successfully!');
      console.log('========================================\n');

      return { success: true, messageId: 'dev-mode-' + Date.now() };
    }

    // Production: Send actual email
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Pattinambakkam_Fish_World'}" <${process.env.FROM_EMAIL || 'noreply@Pattinambakkam_Fish_World.com'}>`,
      to: email,
      subject: 'Welcome to Pattinambakkam_Fish_World!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome ${name}! 🎉</h2>
          <p>Your email has been successfully verified. You can now enjoy all features of Pattinambakkam_Fish_World.</p>
          <p>Thank you for joining us!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">This is an automated email, please do not reply.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};
