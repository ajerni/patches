# Google reCAPTCHA v3 Setup Guide

Google reCAPTCHA v3 has been implemented on your contact form to provide invisible spam protection without disrupting the user experience.

## 🎯 What is reCAPTCHA v3?

- **Invisible**: Runs in the background without user interaction
- **Score-based**: Assigns a score (0.0 - 1.0) based on how likely the user is human
- **No challenges**: No "click the traffic lights" puzzles
- **Better UX**: Users don't even know it's running

## 🔑 Getting Your reCAPTCHA Keys

### Step 1: Go to Google reCAPTCHA Admin Console

Visit: https://www.google.com/recaptcha/admin/create

### Step 2: Register Your Site

1. **Label**: Enter a name (e.g., "Synth Patch Library Contact Form")

2. **reCAPTCHA type**: Select **"reCAPTCHA v3"**

3. **Domains**: Add your domains:
   - `localhost` (for development)
   - Your production domain (e.g., `yoursite.com`)
   - Your Vercel domain (e.g., `yoursite.vercel.app`)

4. **Accept Terms**: Check the box to accept reCAPTCHA Terms of Service

5. Click **"Submit"**

### Step 3: Copy Your Keys

You'll receive two keys:

1. **Site Key** (Public key)
   - Example: `6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - This goes in your frontend code

2. **Secret Key** (Private key)
   - Example: `6LdYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY`
   - This stays secret on your server

## ⚙️ Configuration

### Step 1: Add to Your `.env` File

Add these two lines to your `.env` file:

```env
# Google reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-site-key-here"
RECAPTCHA_SECRET_KEY="your-secret-key-here"
```

**Replace** `your-site-key-here` and `your-secret-key-here` with your actual keys.

### Step 2: Restart Development Server

```bash
npm run dev
```

### Step 3: Test the Form

1. Go to `/about` in your browser
2. Fill out the contact form
3. Submit the message
4. Check your console for "reCAPTCHA score: X.X"

## 🔒 How It Works

### Frontend (Client-Side)

1. reCAPTCHA v3 loads in the background when the page loads
2. When user submits the form, it generates a token
3. Token is sent to your API along with the form data

### Backend (Server-Side)

1. API receives the form data + reCAPTCHA token
2. Server verifies the token with Google's API
3. Google returns a score (0.0 = bot, 1.0 = human)
4. If score ≥ 0.5, form is accepted
5. If score < 0.5, submission is rejected

## 📊 Understanding Scores

reCAPTCHA v3 returns a score for each request:

- **1.0 - 0.9**: Very likely human ✅
- **0.8 - 0.7**: Probably human ✅
- **0.6 - 0.5**: Uncertain (accepted by default) ⚠️
- **0.4 - 0.0**: Likely bot ❌ (rejected)

**Current threshold**: 0.5 (configurable in `/app/api/contact/route.ts`)

### Adjusting the Threshold

Edit line 69 in `/app/api/contact/route.ts`:

```typescript
if (!recaptchaData.success || recaptchaData.score < 0.5) {
  // Change 0.5 to a different value:
  // 0.3 = More lenient (fewer false positives)
  // 0.7 = Stricter (fewer spam messages)
```

## 🚀 Deployment (Vercel)

When deploying to Vercel:

### Option 1: Via Vercel Dashboard

1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add both variables:
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
   - `RECAPTCHA_SECRET_KEY`
4. Redeploy

### Option 2: Via Vercel CLI

```bash
vercel env add NEXT_PUBLIC_RECAPTCHA_SITE_KEY
# Paste your site key when prompted

vercel env add RECAPTCHA_SECRET_KEY
# Paste your secret key when prompted

vercel --prod
```

## 🧪 Testing

### Test as Human

Normal submission should work:
1. Fill out the form normally
2. Submit
3. Should see success message

### Test Bot Behavior

You can't easily simulate a bot, but you can:
1. Check the browser console for the reCAPTCHA score
2. Monitor your server logs for score values
3. View reCAPTCHA analytics in Google Admin Console

### View Analytics

Visit: https://www.google.com/recaptcha/admin
- Select your site
- View request statistics, scores, and actions

## ⚠️ Troubleshooting

### "reCAPTCHA not available" Error

**Problem**: Site key not configured or invalid

**Solutions**:
1. Check your `.env` file has `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
2. Verify the key is correct (copy/paste from Google console)
3. Restart your dev server
4. Clear browser cache

### "reCAPTCHA verification failed" Error

**Problem**: Secret key invalid or token verification failed

**Solutions**:
1. Check your `.env` file has `RECAPTCHA_SECRET_KEY`
2. Verify the key is correct
3. Check domain is registered in reCAPTCHA admin console
4. Ensure server can reach `https://www.google.com/recaptcha/api/siteverify`

### Form Still Gets Spam

**Problem**: Score threshold too low

**Solutions**:
1. Increase threshold from 0.5 to 0.7 in API route
2. Check reCAPTCHA analytics for typical spam scores
3. Add additional spam filtering keywords

### Legitimate Users Being Blocked

**Problem**: Score threshold too high

**Solutions**:
1. Decrease threshold from 0.5 to 0.3
2. Check reCAPTCHA analytics for typical user scores
3. Ask users to try again (scores can vary)

## 🔐 Security Best Practices

✅ **DO:**
- Keep your secret key private (never commit to git)
- Use environment variables
- Monitor reCAPTCHA analytics regularly
- Adjust threshold based on your traffic

❌ **DON'T:**
- Share your secret key
- Commit keys to version control
- Use the same keys for multiple sites
- Set threshold too low (< 0.3)

## 📈 Monitoring

### View reCAPTCHA Performance

1. Visit: https://www.google.com/recaptcha/admin
2. Select your site
3. View:
   - Request volume
   - Score distribution
   - Detected bot traffic
   - Legitimate user patterns

### Server Logs

Check your server logs for:
```
reCAPTCHA score: 0.9
```

Higher scores = more human-like behavior

## 🎛️ Advanced Configuration

### Custom Actions

You can create different actions for different forms:

```typescript
// Contact form
const token = await executeRecaptcha('contact_form');

// Login form
const token = await executeRecaptcha('login');

// Registration
const token = await executeRecaptcha('register');
```

Then monitor these separately in reCAPTCHA analytics.

### Badge Positioning

reCAPTCHA v3 shows a small badge in the corner. To hide it (optional):

Add to your CSS:
```css
.grecaptcha-badge {
  visibility: hidden;
}
```

**Note**: If you hide the badge, you must include this text in your privacy policy:
> "This site is protected by reCAPTCHA and the Google [Privacy Policy](https://policies.google.com/privacy) and [Terms of Service](https://policies.google.com/terms) apply."

## 📚 Additional Resources

- [reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [React Google reCAPTCHA v3 Library](https://github.com/t49tran/react-google-recaptcha-v3)

## ✅ Summary

Your contact form is now protected by reCAPTCHA v3:

- ✅ Invisible to users
- ✅ No interaction required
- ✅ Score-based spam detection
- ✅ Analytics and monitoring
- ✅ Easy to configure

**Next Steps:**
1. Get your reCAPTCHA keys from Google
2. Add them to your `.env` file
3. Restart your server
4. Test the form
5. Monitor analytics

Your form is now significantly more secure! 🔒

