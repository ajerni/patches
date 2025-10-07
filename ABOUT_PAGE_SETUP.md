# About Page Setup Guide

The About page has been successfully added to your project with a contact form and donation options.

## Features

### 1. Contact Form
- **Location**: `/about`
- **Features**:
  - Name, email, subject, and message fields
  - Client-side validation
  - Rate limiting (3 submissions per minute per IP)
  - Spam keyword filtering
  - Auto-reply to sender
  - Notification email to admin
  - Loading states and success/error messages

### 2. PayPal Donation
- Pre-configured with your PayPal business ID
- Ready to use - no additional setup needed

### 3. Cryptocurrency Donations
- Placeholder addresses for BTC, ETH, and USDT
- **Action Required**: Replace placeholder addresses with your actual wallet addresses

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

### 3. Optional: Add Google reCAPTCHA (Enhanced Security)

For additional spam protection, you can add Google reCAPTCHA v3:

1. Get reCAPTCHA keys from: https://www.google.com/recaptcha/admin
2. Add to `.env`:
   ```
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
   RECAPTCHA_SECRET_KEY=your_secret_key
   ```
3. Install package: `npm install react-google-recaptcha-v3`
4. Update the contact form component to include reCAPTCHA verification

## Navigation

The "About" link has been added to:
- **Desktop Menu**: Top navigation bar
- **Mobile Menu**: Hamburger menu

## Rate Limiting

The contact form includes basic rate limiting:
- **Limit**: 3 submissions per minute per IP address
- **Implementation**: In-memory storage (sufficient for most use cases)
- **For Production**: Consider using Redis or a database for distributed systems

## Spam Protection

Current protections:
1. Rate limiting
2. Email format validation
3. Basic spam keyword filtering
4. Required field validation

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

1. **Contact Form**:
   - Submit a test message
   - Check if emails are received
   - Verify auto-reply is sent

2. **PayPal**:
   - Click the donate button
   - Verify it redirects to PayPal correctly

3. **Rate Limiting**:
   - Try submitting 4 messages quickly
   - Should see rate limit error on 4th attempt

## Security Notes

- Email credentials are stored in environment variables
- Rate limiting prevents spam/abuse
- Basic input validation and sanitization
- Consider adding reCAPTCHA for production use
- All emails are sent from your verified Gmail account

## Support

If you encounter issues:
1. Check that `GOOGLE_PATCHES_EMAIL` and `GOOGLE_PATCHES_APP_PASSWORD` are set in `.env`
2. Verify your Gmail account allows app passwords
3. Check server logs for detailed error messages
4. Ensure all dependencies are installed (`nodemailer` should already be installed)

## Next Steps

1. ✅ Add your cryptocurrency wallet addresses
2. ✅ Update the mission statement to match your vision
3. ✅ Test the contact form
4. ✅ (Optional) Set up Google reCAPTCHA
5. ✅ Deploy and share!

