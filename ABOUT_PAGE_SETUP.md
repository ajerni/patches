# About Page Setup Guide

The About page has been successfully added to your project with a contact form and donation options.

## Page Structure

- **Public sections** (visible to everyone):
  - Mission statement
  - PayPal donation button
  - Cryptocurrency donation addresses

- **Protected section** (requires login):
  - Contact form ("Get in Touch")

## Features

### 1. Contact Form
- **Location**: `/about` (Contact form section requires login)
- **Features**:
  - **Login required** - Users must be authenticated to use the contact form
  - **Login prompt for guests** - Non-authenticated visitors see a login/register prompt in place of the form
  - **Auto-populated fields** - Name and email prepopulated from user account
  - Subject and message fields
  - Client-side validation
  - **Google reCAPTCHA v3 protection** (invisible spam protection)
  - Rate limiting (3 submissions per minute per IP)
  - Spam keyword filtering
  - Auto-reply to sender
  - Notification email to admin
  - Loading states and success/error messages

### 2. PayPal Donation
- Pre-configured with your PayPal business ID
- Ready to use - no additional setup needed
- **Publicly visible** - No login required

### 3. Cryptocurrency Donations
- Bitcoin and Ethereum addresses from environment variables
- Copy-to-clipboard functionality
- **Publicly visible** - No login required

## Setup Instructions

### 1. Email Configuration (Already Set Up)
The contact form uses your existing email configuration:
- `GOOGLE_PATCHES_EMAIL` - Your Gmail address
- `GOOGLE_PATCHES_APP_PASSWORD` - Your Gmail App Password

These are already configured from your password reset feature, so no additional setup is needed!

### 2. Add Cryptocurrency Addresses

Add your cryptocurrency wallet addresses to your `.env` file:

```env
# Cryptocurrency Donation Addresses (Public - displayed on About page)
NEXT_PUBLIC_BTC_ADDRESS="your-bitcoin-address-here"
NEXT_PUBLIC_ETH_ADDRESS="your-ethereum-address-here"
```

**Important Notes:**
- These use the `NEXT_PUBLIC_` prefix because they are displayed publicly on the About page
- If an address is not configured, it will show "BTC/ETH address not configured"
- You can add more cryptocurrency options by editing `/app/about/page.tsx`
- After adding addresses, restart your development server for changes to take effect

### 3. Configure Google reCAPTCHA v3 (Required for Contact Form)

The contact form is protected by Google reCAPTCHA v3 (invisible spam protection). You need to configure it:

1. **Get reCAPTCHA keys**: Visit https://www.google.com/recaptcha/admin/create
2. **Select reCAPTCHA v3** (not v2)
3. **Add domains**: 
   - `localhost` (for development)
   - Your production domain
   - Your Vercel domain
4. **Copy your keys** and add to `.env`:
   ```env
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-site-key-here"
   RECAPTCHA_SECRET_KEY="your-secret-key-here"
   ```
5. **Restart your server**: The form will now validate submissions with reCAPTCHA

**📖 Detailed Setup Guide**: See [RECAPTCHA_SETUP.md](./RECAPTCHA_SETUP.md) for complete instructions

## Navigation

The "About" link has been added to:
- **Desktop Menu**: Top navigation bar
- **Mobile Menu**: Hamburger menu

**Access Control**:
- **Public sections**: Mission statement and donation options are visible to everyone
- **Protected section**: Only the "Get in Touch" contact form requires login
- **For non-authenticated users**: A login prompt is shown in place of the contact form

## Rate Limiting

The contact form includes basic rate limiting:
- **Limit**: 3 submissions per minute per IP address
- **Implementation**: In-memory storage (sufficient for most use cases)
- **For Production**: Consider using Redis or a database for distributed systems

## Spam Protection

Current protections:
1. **Authentication required** - Only logged-in users can submit messages
2. **Email verification** - Email must match the user's registered account
3. **Google reCAPTCHA v3** - Invisible bot detection with score-based verification
4. Rate limiting (3 requests/minute/IP)
5. Email format validation
6. Basic spam keyword filtering
7. Required field validation

**Note**: The form will only work after you configure reCAPTCHA keys in your `.env` file. See [RECAPTCHA_SETUP.md](./RECAPTCHA_SETUP.md) for setup instructions.

## Email Templates

Two emails are sent per contact form submission:

1. **Admin Notification**:
   - Sent to: Your email (`GOOGLE_PATCHES_EMAIL`)
   - Contains: Sender details, subject, message, and IP address

2. **Auto-Reply**:
   - Sent to: User's email
   - Contains: Confirmation message and copy of their submission

## Customization

### Update Mission Statement
Edit the "Our Mission" section in `/app/about/page.tsx` to reflect your project's vision.

### Modify Donation Options
You can:
- Add more cryptocurrency options
- Change the PayPal button styling
- Add other payment methods (Stripe, GitHub Sponsors, etc.)

### Contact Form Fields
To add/remove fields, update:
1. Form state in `AboutPage` component
2. Form inputs in the JSX
3. API route validation in `/app/api/contact/route.ts`

## Testing

1. **Public Access**:
   - Visit `/about` while logged out - should see mission statement and donation options
   - Contact form section should show a login prompt

2. **Authentication**:
   - Login and visit `/about` - should see the same public content plus the contact form with prepopulated email

3. **Contact Form**:
   - Name and email fields should be disabled and auto-filled
   - Submit a test message with subject and message
   - Check if emails are received (both admin notification and auto-reply)
   - Verify form clears only subject and message (keeping name/email)

3. **PayPal**:
   - Click the donate button
   - Verify it redirects to PayPal correctly

4. **Rate Limiting**:
   - Try submitting 4 messages quickly
   - Should see rate limit error on 4th attempt

5. **Security**:
   - Try accessing the contact API directly without being logged in - should get 401 error
   - Verify you cannot submit with a different email than your account email

## Security Notes

- ✅ **Authentication required** - Only logged-in users can access the contact form
- ✅ **Email verification** - Server validates email matches user's account
- ✅ **reCAPTCHA v3 implemented** - Invisible bot protection
- ✅ Email credentials are stored in environment variables
- ✅ Rate limiting prevents spam/abuse (3 per minute per IP)
- ✅ Input validation and sanitization
- ✅ All emails are sent from your verified Gmail account
- ✅ Score-based spam detection (threshold: 0.5)
- ✅ User accountability - All messages tracked to registered users

## Support

If you encounter issues:
1. Check that `GOOGLE_PATCHES_EMAIL` and `GOOGLE_PATCHES_APP_PASSWORD` are set in `.env`
2. Verify your Gmail account allows app passwords
3. Check server logs for detailed error messages
4. Ensure all dependencies are installed (`nodemailer` should already be installed)

## Next Steps

1. ✅ **Configure reCAPTCHA v3** (see [RECAPTCHA_SETUP.md](./RECAPTCHA_SETUP.md))
2. ✅ Add your cryptocurrency wallet addresses to `.env`
3. ✅ Update the mission statement to match your vision
4. ✅ Test the contact form
5. ✅ Deploy and share!

