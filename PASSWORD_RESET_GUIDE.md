# Password Reset Feature - Implementation Guide

## Overview
This document describes the password reset functionality implemented for the Synth Patch Library application.

## Features Implemented

### 1. **Database Schema**
- Created `password_reset_tokens` table with:
  - Unique token storage
  - User association (foreign key to users table)
  - Expiration timestamp (1 hour validity)
  - Used flag to prevent token reuse
  - Automatic cleanup of expired tokens

### 2. **Email System**
- Configured nodemailer with Gmail
- Professional HTML email template
- Plain text fallback for email clients
- Token embedded in reset link
- Clear instructions and expiration notice

### 3. **API Routes**

#### POST `/api/auth/forgot-password`
- Accepts email address
- Generates secure random token (32 bytes)
- Creates database record with 1-hour expiration
- Sends password reset email
- Returns generic success message (prevents email enumeration)
- Cleans up old unused tokens

#### GET `/api/auth/reset-password?token=xxx`
- Verifies token validity
- Checks expiration
- Returns user email if valid
- Returns error if token is invalid, expired, or used

#### POST `/api/auth/reset-password`
- Accepts token and new password
- Validates password strength (min 6 characters)
- Updates user password (bcrypt hashed)
- Marks token as used
- Returns success/error message

### 4. **User Interface**

#### `/forgot-password` - Request Reset
- Email input form
- Success message with instructions
- Link back to login
- Mobile-friendly design

#### `/reset-password?token=xxx` - Reset Password
- Automatic token verification
- New password input with confirmation
- Password strength validation
- Success message with auto-redirect
- Error handling for invalid/expired tokens

#### `/login` - Enhanced
- Added "Forgot password?" link
- Success message display after password reset
- Mobile-friendly layout

## Setup Instructions

### 1. Database Setup

Run the SQL migration to create the password reset tokens table:

```bash
# Connect to your PostgreSQL database and run:
psql -d your_database_name -f create-password-reset-table.sql
```

Or manually create the table using the SQL in `create-password-reset-table.sql`.

### 2. Prisma Setup

The Prisma schema has been updated with the `PasswordResetToken` model. Generate the Prisma client:

```bash
npx prisma generate
```

If you need to sync your database with the Prisma schema:

```bash
npx prisma db push
```

### 3. Environment Variables

Add the following to your `.env` file:

```env
# Gmail Configuration for Password Reset Emails
GOOGLE_PATCHES_EMAIL=your-email@gmail.com
GOOGLE_PATCHES_APP_PASSWORD=your-app-specific-password

# Next Auth URL (for email links)
NEXTAUTH_URL=http://localhost:3000  # Update for production
```

**Note:** For Gmail, you need to:
1. Enable 2-factor authentication on your Google account
2. Generate an App Password (not your regular Gmail password)
3. Go to: https://myaccount.google.com/apppasswords

### 4. Install Dependencies

The following packages have been installed:
- `nodemailer` - Email sending
- `@types/nodemailer` - TypeScript types

## Testing the Password Reset Flow

### Step 1: Request Password Reset

1. Go to `/login`
2. Click "Forgot password?"
3. Enter your email address
4. Click "Send Reset Link"
5. Check your email inbox (and spam folder)

### Step 2: Verify Email

You should receive an email with:
- Password reset link with embedded token
- Expiration notice (1 hour)
- Instructions
- Professional HTML formatting

### Step 3: Reset Password

1. Click the link in the email (or copy/paste into browser)
2. The system will verify the token automatically
3. If valid, you'll see the password reset form
4. Enter your new password (min 6 characters)
5. Confirm your new password
6. Click "Reset Password"
7. You'll see a success message and be redirected to login

### Step 4: Login with New Password

1. You'll be redirected to `/login` with a success message
2. Enter your email and new password
3. Click "Sign In"
4. You should be logged in successfully

## Security Features

1. **Token Security**
   - Cryptographically secure random tokens (32 bytes)
   - One-time use tokens (marked as used after reset)
   - 1-hour expiration window
   - Automatic cleanup of old tokens

2. **Email Enumeration Prevention**
   - Generic success message regardless of email existence
   - No indication if email is registered or not

3. **Password Security**
   - Minimum 6 characters enforced
   - Bcrypt hashing (10 rounds)
   - Password confirmation required

4. **Rate Limiting** (Recommended)
   - Consider adding rate limiting to prevent abuse
   - Suggested: 3 requests per email per hour

## File Structure

```
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── forgot-password/
│   │       │   └── route.ts          # Request reset endpoint
│   │       └── reset-password/
│   │           └── route.ts          # Reset password endpoint
│   ├── forgot-password/
│   │   └── page.tsx                  # Request reset UI
│   ├── reset-password/
│   │   └── page.tsx                  # Reset password UI
│   └── login/
│       └── page.tsx                  # Updated with forgot password link
├── lib/
│   └── email.ts                      # Nodemailer configuration
├── prisma/
│   └── schema.prisma                 # Updated with PasswordResetToken model
└── create-password-reset-table.sql  # Database migration
```

## Troubleshooting

### Email Not Sending

1. **Check Gmail App Password**
   ```bash
   # Verify environment variables
   echo $GOOGLE_PATCHES_EMAIL
   echo $GOOGLE_PATCHES_APP_PASSWORD
   ```

2. **Check Gmail Settings**
   - 2FA must be enabled
   - App Password must be generated (not regular password)
   - Less secure app access is NOT needed for App Passwords

3. **Test Email Connection**
   ```javascript
   import { verifyEmailConnection } from '@/lib/email';
   await verifyEmailConnection();
   ```

4. **Check Server Logs**
   - Look for nodemailer errors in console
   - Check email sending success/failure messages

### Token Issues

1. **Token Expired**
   - Tokens expire after 1 hour
   - User must request a new reset link

2. **Token Already Used**
   - Tokens can only be used once
   - User must request a new reset link

3. **Invalid Token**
   - Check URL is complete and not truncated
   - Ensure token hasn't been modified

### Database Issues

1. **Table Not Found**
   ```bash
   # Run the migration
   psql -d your_database_name -f create-password-reset-table.sql
   ```

2. **Prisma Out of Sync**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Production Considerations

### Before Deploying to Production:

1. **Update Environment Variables**
   ```env
   NEXTAUTH_URL=https://your-production-domain.com
   GOOGLE_PATCHES_EMAIL=your-production-email@gmail.com
   GOOGLE_PATCHES_APP_PASSWORD=your-production-app-password
   ```

2. **Add Rate Limiting**
   - Implement rate limiting on password reset requests
   - Suggested: Use `express-rate-limit` or similar

3. **Add Monitoring**
   - Log password reset attempts
   - Monitor for suspicious activity
   - Track email delivery success/failure

4. **Email Deliverability**
   - Consider using a dedicated email service (SendGrid, AWS SES, etc.)
   - Gmail has sending limits (consider for high-traffic apps)
   - Set up SPF, DKIM, and DMARC records

5. **Add CAPTCHA** (Optional)
   - Add reCAPTCHA to forgot password form
   - Prevents automated abuse

6. **Token Cleanup**
   - Consider running a scheduled job to clean up expired tokens
   - PostgreSQL cron extension: `pg_cron`
   - Or external cron job calling API endpoint

## Email Template Customization

To customize the email template, edit `/lib/email.ts`:

```typescript
export async function sendPasswordResetEmail({
  to,
  name,
  resetToken,
}: SendPasswordResetEmailOptions) {
  // Customize the HTML and text content here
}
```

## Future Enhancements

Potential improvements:
1. Add email verification for new accounts
2. Add "Email changed" notification emails
3. Add 2-factor authentication
4. Add login attempt notifications
5. Add account activity logs
6. Add password strength meter on UI
7. Add "Remember device" feature

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for detailed error messages
3. Verify all environment variables are set correctly
4. Test email configuration with `verifyEmailConnection()`

## License

This password reset implementation follows the same license as the main application.

