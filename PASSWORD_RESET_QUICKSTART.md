# Password Reset - Quick Start Guide

## ✅ What's Been Implemented

✓ Database schema for password reset tokens  
✓ Email sending with nodemailer + Gmail  
✓ API routes for requesting and resetting passwords  
✓ UI pages for password reset flow  
✓ Integration with login page  

## 🚀 Quick Setup (5 minutes)

### Step 1: Update Database Schema

Since we're using Prisma, simply push the updated schema to your database:

```bash
npx prisma db push
```

This will create the `password_reset_tokens` table automatically.

### Step 2: Configure Gmail App Password

1. Go to your Google Account: https://myaccount.google.com
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Generate a new app password:
   - Select app: **Mail**
   - Select device: **Other** (name it "Synth Patch Library")
   - Copy the 16-character password

### Step 3: Update Environment Variables

Add these to your `.env` file:

```env
# Gmail Configuration
GOOGLE_PATCHES_EMAIL=your-email@gmail.com
GOOGLE_PATCHES_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Make sure this is set (should already exist)
NEXTAUTH_URL=http://localhost:3000
```

**Important:** Use the App Password, NOT your regular Gmail password!

### Step 4: Test the Feature

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to: http://localhost:3000/login

3. Click **"Forgot password?"**

4. Enter your email (must be a registered user)

5. Check your email inbox (and spam folder)

6. Click the reset link in the email

7. Enter a new password

8. Log in with your new password

## 📧 Email Preview

The password reset email includes:
- Professional branding (Synth Patch Library)
- Clear call-to-action button
- Direct reset link
- Expiration notice (1 hour)
- Security information

## 🔒 Security Features

- ✓ Secure random tokens (32 bytes)
- ✓ 1-hour token expiration
- ✓ One-time use tokens
- ✓ Bcrypt password hashing
- ✓ Email enumeration protection
- ✓ Automatic expired token cleanup

## 🔧 Troubleshooting

### "Failed to send email"
- Check Gmail App Password is correct (16 characters, no spaces in .env)
- Verify 2-factor authentication is enabled on Google account
- Make sure `GOOGLE_PATCHES_EMAIL` matches the Gmail account

### "Invalid token" or "Token expired"
- Tokens expire after 1 hour
- Tokens can only be used once
- Request a new password reset

### Email not received
- Check spam/junk folder
- Verify the email address is registered in your app
- Check server console for email sending errors

## 📁 Files Created/Modified

**New Files:**
- `lib/email.ts` - Email configuration
- `app/api/auth/forgot-password/route.ts` - Request reset API
- `app/api/auth/reset-password/route.ts` - Reset password API
- `app/forgot-password/page.tsx` - Request reset page
- `app/reset-password/page.tsx` - Reset password page
- `create-password-reset-table.sql` - SQL schema (reference only)

**Modified Files:**
- `prisma/schema.prisma` - Added PasswordResetToken model
- `app/login/page.tsx` - Added "Forgot password?" link
- `package.json` - Added nodemailer dependencies

## 🎯 Next Steps (Optional)

Consider adding:
- Rate limiting (prevent abuse)
- CAPTCHA on forgot password form
- Scheduled cleanup of expired tokens
- Email service upgrade (SendGrid, AWS SES) for production

## ✅ Ready to Use!

The password reset feature is now fully functional and ready to test. All security best practices have been implemented.

For detailed documentation, see `PASSWORD_RESET_GUIDE.md`.

