# ImageKit Setup Guide

## Environment Variables

Your `.env.local` should have these ImageKit variables:

```env
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="your_public_key"
IMAGEKIT_PRIVATE_KEY="your_private_key"
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_imagekit_id"
```

## Why `NEXT_PUBLIC_` Prefix?

In Next.js, environment variables work differently depending on where they're used:

### Server-Side Only (No Prefix)
```env
IMAGEKIT_PRIVATE_KEY="..."  ← Only available in API routes/server components
```
- ✅ Secure - never exposed to the browser
- ✅ Used for server-side operations
- ❌ Not accessible in client components

### Client + Server (NEXT_PUBLIC_ Prefix)
```env
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="..."  ← Available everywhere
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="..." ← Available everywhere
```
- ✅ Available in both client and server code
- ⚠️ Visible in browser (safe for public keys)
- ✅ Can be used in React components

## Our ImageKit Configuration

### ✅ Correct Setup (Current)

```typescript
// lib/imagekit.ts
export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,  // Public - safe to expose
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,            // Private - server only
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT // Public - safe to expose
});
```

**Why this works:**
- ✅ `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` - Public key is meant to be public
- ✅ `IMAGEKIT_PRIVATE_KEY` - Private key stays on server (secure!)
- ✅ `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` - URL endpoint is public anyway

## Security Best Practices

### Safe to Expose (NEXT_PUBLIC_)
- ✅ Public Key - Designed to be public
- ✅ URL Endpoint - Already visible in image URLs
- ✅ Any public configuration

### Must Stay Secret (No prefix)
- ❌ Private Key - Never expose!
- ❌ Database passwords
- ❌ API secrets
- ❌ NextAuth secret

## How ImageKit Works in This App

### Server-Side (API Route)
```typescript
// app/api/imagekit/auth/route.ts
import { imagekit } from "@/lib/imagekit";

export async function GET() {
  // Server-side: Has access to private key
  const authParams = imagekit.getAuthenticationParameters();
  return NextResponse.json(authParams);
}
```

### Client-Side (Future Implementation)
If you want to upload images directly from the browser:

```typescript
// components/ImageUpload.tsx
const uploadImage = async (file: File) => {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  
  // Get auth params from server
  const authResponse = await fetch('/api/imagekit/auth');
  const authParams = await authResponse.json();
  
  // Upload using public key (safe!)
  const formData = new FormData();
  formData.append('file', file);
  formData.append('publicKey', publicKey);
  // ... upload logic
};
```

## Current Implementation

Right now, the app expects you to **manually upload images to ImageKit** and paste the URLs. This is:
- ✅ Simple and secure
- ✅ Full control over images
- ✅ No complex upload logic needed

### How to Use (Current):

1. **Upload to ImageKit Dashboard:**
   - Go to [https://imagekit.io](https://imagekit.io)
   - Upload your patch images
   - Copy the image URL

2. **Add to Patch:**
   - When creating/editing a patch
   - Paste the ImageKit URL in the "Images" section
   - Example: `https://ik.imagekit.io/your_id/patch_cable.jpg`

## Future Enhancement: Direct Upload

If you want users to upload images directly from the app (optional):

### 1. Install ImageKit React SDK
```bash
npm install imagekitio-react
```

### 2. Create Upload Component
```typescript
'use client'
import { IKContext, IKUpload } from 'imagekitio-react'

export function ImageUpload() {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
  
  return (
    <IKContext
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticationEndpoint="/api/imagekit/auth"
    >
      <IKUpload
        onSuccess={(res) => {
          console.log('Upload successful:', res.url);
        }}
      />
    </IKContext>
  );
}
```

This would allow drag-and-drop uploads directly in the patch form!

## Verifying Your Setup

### Check Environment Variables
Create a test API route to verify (remove after testing):

```typescript
// app/api/test-env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasPublicKey: !!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    hasPrivateKey: !!process.env.IMAGEKIT_PRIVATE_KEY,
    hasUrlEndpoint: !!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    // Don't expose actual values!
  });
}
```

Visit `http://localhost:3000/api/test-env` - all should be `true`.

## Troubleshooting

### "Cannot read properties of undefined"
- Restart your dev server: `npm run dev`
- Next.js needs restart to pick up new env variables

### "ImageKit authentication failed"
- Check private key is correct
- Verify no extra spaces in `.env.local`
- Ensure private key doesn't have `NEXT_PUBLIC_` prefix

### Images not loading
- Verify URL endpoint matches your ImageKit account
- Check image URLs start with your endpoint
- Ensure images are public in ImageKit dashboard

## Summary

Your ImageKit setup is now configured correctly:

✅ **Public Key** - `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`  
✅ **Private Key** - `IMAGEKIT_PRIVATE_KEY` (secure!)  
✅ **URL Endpoint** - `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`  

The `NEXT_PUBLIC_` prefix is the **correct** way to handle these in Next.js!

---

**Ready to test?** Run `npm run dev` and your ImageKit integration will work with your existing credentials! 🎨

