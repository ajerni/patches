# Quick Setup Guide

Follow these steps to get your Eurorack Patch Library up and running:

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory with these variables:

```env
# Database - Your PostgreSQL connection from Render.com
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# NextAuth - Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="paste-your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# ImageKit - From your ImageKit.io dashboard under Developer Options
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="your_public_key"
IMAGEKIT_PRIVATE_KEY="your_private_key"
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_imagekit_id"
```

### Generate NextAuth Secret:
```bash
openssl rand -base64 32
```

## Step 3: Set Up Database

```bash
# Push the schema to your database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

## Step 4: Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## Step 5: Create Your First Account

1. Click "Register" in the navigation
2. Fill in your details
3. Create your account
4. Log in and start documenting patches!

## Next Steps

### Setting Up ImageKit.io

1. Sign up at [https://imagekit.io](https://imagekit.io)
2. Go to **Developer** section
3. Copy your credentials:
   - Public Key
   - Private Key
   - URL Endpoint
4. Add them to your `.env.local` file

### Setting Up hearthis.at

1. Create account at [https://hearthis.at](https://hearthis.at)
2. Upload your patch audio files
3. Copy the track URLs (e.g., `https://hearthis.at/username/trackname/`)
4. Use these URLs when adding sounds to your patches

## Troubleshooting

### Database Connection Error
- Verify your `DATABASE_URL` is correct
- Ensure your Render.com database is active
- Check that you included `?sslmode=require` at the end

### Can't Login
- Make sure you ran `npx prisma db push`
- Check that `NEXTAUTH_SECRET` is set in `.env.local`
- Try registering a new account

### Images Not Loading
- Verify all ImageKit credentials are correct
- Check that the URL endpoint includes your ImageKit ID
- Make sure the image URLs start with your ImageKit endpoint

## Production Deployment

When deploying to Vercel or another platform:

1. Add all environment variables in your hosting dashboard
2. Update `NEXTAUTH_URL` to your production domain
3. Deploy!

## Need Help?

Check the full README.md for detailed documentation.

