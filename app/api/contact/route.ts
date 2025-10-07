import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Rate limiting: simple in-memory store (for production, use Redis or similar)
const recentSubmissions = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_SUBMISSIONS = 3; // Max 3 submissions per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const submissions = recentSubmissions.get(ip) || 0;
  
  // Clean up old entries
  for (const [key, timestamp] of recentSubmissions.entries()) {
    if (now - timestamp > RATE_LIMIT_WINDOW) {
      recentSubmissions.delete(key);
    }
  }
  
  if (submissions >= MAX_SUBMISSIONS) {
    return false;
  }
  
  recentSubmissions.set(ip, submissions + 1);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { name, email, subject, message } = await request.json();

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check for spam-like content (very basic)
    const spamKeywords = ['viagra', 'casino', 'lottery', 'click here', 'buy now'];
    const content = `${subject} ${message}`.toLowerCase();
    if (spamKeywords.some(keyword => content.includes(keyword))) {
      return NextResponse.json(
        { error: 'Message flagged as potential spam' },
        { status: 400 }
      );
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GOOGLE_PATCHES_EMAIL,
        pass: process.env.GOOGLE_PATCHES_APP_PASSWORD,
      },
    });

    // Email to admin
    const adminMailOptions = {
      from: process.env.GOOGLE_PATCHES_EMAIL,
      to: process.env.GOOGLE_PATCHES_EMAIL, // Send to yourself
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>From:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #4F46E5; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6; color: #555;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>This email was sent from the Synth Patch Library contact form.</p>
            <p>IP Address: ${ip}</p>
          </div>
        </div>
      `,
    };

    // Auto-reply to sender
    const autoReplyOptions = {
      from: process.env.GOOGLE_PATCHES_EMAIL,
      to: email,
      subject: 'Thank you for contacting Synth Patch Library',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">
            Thank You for Your Message!
          </h2>
          
          <p style="line-height: 1.6; color: #555;">
            Hi ${name},
          </p>
          
          <p style="line-height: 1.6; color: #555;">
            Thank you for reaching out to us. We've received your message and will get back to you as soon as possible.
          </p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0; color: #666;"><strong>Your message:</strong></p>
            <p style="margin: 10px 0; color: #666;"><strong>Subject:</strong> ${subject}</p>
            <p style="white-space: pre-wrap; line-height: 1.6; color: #666; font-size: 14px;">${message}</p>
          </div>
          
          <p style="line-height: 1.6; color: #555;">
            Best regards,<br/>
            The Synth Patch Library Team
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>This is an automated reply. Please do not respond to this email.</p>
          </div>
        </div>
      `,
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(autoReplyOptions);

    return NextResponse.json(
      { success: true, message: 'Message sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}

