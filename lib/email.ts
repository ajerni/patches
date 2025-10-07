import nodemailer from 'nodemailer';

// Create reusable transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GOOGLE_PATCHES_EMAIL,
    pass: process.env.GOOGLE_PATCHES_APP_PASSWORD,
  },
});

interface SendPasswordResetEmailOptions {
  to: string;
  name: string;
  resetToken: string;
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetToken,
}: SendPasswordResetEmailOptions) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Synth Patch Library" <${process.env.GOOGLE_PATCHES_EMAIL}>`,
    to,
    subject: 'Password Reset Request - Synth Patch Library',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .button {
              display: inline-block;
              padding: 14px 28px;
              background-color: #2563eb;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #1d4ed8;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
              text-align: center;
            }
            .token-box {
              background-color: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
              font-family: monospace;
              word-break: break-all;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎹 Synth Patch Library</div>
              <h1 style="color: #111827; margin: 0;">Password Reset Request</h1>
            </div>
            
            <p>Hi ${name},</p>
            
            <p>We received a request to reset your password for your Synth Patch Library account. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <div class="token-box">${resetUrl}</div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in 1 hour and can only be used once.
            </div>
            
            <p><strong>Didn't request a password reset?</strong> You can safely ignore this email. Your password will remain unchanged.</p>
            
            <div class="footer">
              <p>This is an automated email from Synth Patch Library. Please do not reply to this email.</p>
              <p style="margin-top: 10px;">© ${new Date().getFullYear()} Synth Patch Library. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Password Reset Request - Synth Patch Library

Hi ${name},

We received a request to reset your password for your Synth Patch Library account.

To reset your password, visit this link:
${resetUrl}

This link will expire in 1 hour and can only be used once.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

© ${new Date().getFullYear()} Synth Patch Library. All rights reserved.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

// Test email configuration
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('Email server is ready to send emails');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
}

