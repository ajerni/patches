# Eurorack Patch Library

A modern, beautiful web application for documenting and organizing your Eurorack modular synthesis patches. Built with Next.js, PostgreSQL, and integrated with ImageKit.io and hearthis.at.

## Features

- 🔐 **User Authentication** - Secure registration and login system
- 📝 **Rich Documentation** - Comprehensive fields for patch details:
  - Title and Description
  - Step-by-step Instructions
  - Personal Notes
  - Tags for easy organization
- 🖼️ **Image Storage** - Upload and display patch images via ImageKit.io
- 🎵 **Audio Integration** - Link audio examples from hearthis.at
- 🔍 **Search & Filter** - Quickly find patches by title, description, or tags
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- ⚡ **Fast & Modern** - Built with Next.js 14 and TypeScript

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (hosted on Render.com)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Image Storage**: ImageKit.io
- **Audio Storage**: hearthis.at
- **Icons**: Lucide React

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ and npm
- PostgreSQL database (e.g., on Render.com)
- ImageKit.io account
- hearthis.at account (for audio uploads)

## Getting Started

### 1. Clone the Repository

```bash
cd /Users/andi/projekte/patches
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="your_imagekit_public_key"
IMAGEKIT_PRIVATE_KEY="your_imagekit_private_key"
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_imagekit_id"
```

**To generate a NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Set Up the Database

Run Prisma migrations to create the database tables:

```bash
npx prisma migrate dev --name init
```

Generate the Prisma client:

```bash
npx prisma generate
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Setup (Render.com)

1. Create a PostgreSQL database on [Render.com](https://render.com/)
2. Copy the **External Database URL**
3. Add it to your `.env` file as `DATABASE_URL`
4. Make sure to append `?sslmode=require` to the URL

Example:
```
DATABASE_URL="postgresql://user:pass@dpg-xxxxx.oregon-postgres.render.com/dbname?sslmode=require"
```

## ImageKit.io Setup

1. Create an account on [ImageKit.io](https://imagekit.io/)
2. Navigate to Developer Options in your dashboard
3. Copy your:
   - Public Key
   - Private Key
   - URL Endpoint
4. Add them to your `.env` file

## Using the Application

### 1. Register an Account
- Navigate to `/register`
- Fill in your name, email, and password
- Click "Create Account"

### 2. Create a Patch
- Log in to your account
- Click "New Patch" from the dashboard
- Fill in the patch details:
  - **Title**: Give your patch a name
  - **Description**: Describe what the patch does
  - **Instructions**: Step-by-step recreation guide
  - **Notes**: Additional observations
  - **Tags**: Add tags for organization (e.g., "ambient", "drone", "percussive")
  - **Images**: Upload directly or add ImageKit.io URLs
  - **Sounds**: Just paste hearthis.at track URLs (e.g., `https://hearthis.at/user/track/`) - automatic conversion to embedded player!

### 3. Manage Patches
- View all patches in the dashboard
- Search patches by title, description, or tags
- Edit or delete existing patches
- View detailed patch information

## Project Structure

```
patches/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── imagekit/     # ImageKit auth
│   │   └── patches/      # Patch CRUD endpoints
│   ├── dashboard/        # User dashboard
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── patches/          # Patch pages (new, view, edit)
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── Navbar.tsx        # Navigation bar
│   ├── PatchForm.tsx     # Patch create/edit form
│   └── Providers.tsx     # Session provider
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── imagekit.ts       # ImageKit setup
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/
│   └── schema.prisma     # Database schema
├── types/
│   └── next-auth.d.ts    # TypeScript declarations
├── .env                   # Environment variables
├── .gitignore
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Database Schema

### User Model
- `id`: Unique identifier
- `email`: User email (unique)
- `name`: User's name
- `password`: Hashed password
- `patches`: Relation to Patch model

### Patch Model
- `id`: Unique identifier
- `title`: Patch title
- `description`: Patch description
- `instructions`: Optional step-by-step guide
- `notes`: Optional notes
- `tags`: Array of tags
- `images`: Array of image URLs
- `sounds`: Array of sound URLs
- `userId`: Foreign key to User
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Patches
- `GET /api/patches` - Get all patches for authenticated user
- `POST /api/patches` - Create new patch
- `GET /api/patches/[id]` - Get specific patch
- `PUT /api/patches/[id]` - Update patch
- `DELETE /api/patches/[id]` - Delete patch

### ImageKit
- `GET /api/imagekit/auth` - Get ImageKit authentication parameters

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add all environment variables in the Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set all environment variables in your production environment:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (set to your production URL)
- `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`

## Uploading Images to ImageKit

1. Log in to your ImageKit.io dashboard
2. Upload images of your patches
3. Copy the image URL
4. Paste it into the "Images" section when creating/editing a patch

## Uploading Audio to hearthis.at

1. Create an account on [hearthis.at](https://hearthis.at/)
2. Upload your patch audio
3. Copy the track URL (e.g., `https://hearthis.at/username/patchname/`)
4. Add it to the "Sounds" section when creating/editing a patch

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio

# Lint code
npm run lint
```

## Troubleshooting

### Database Connection Issues
- Ensure your PostgreSQL database is running
- Check that `DATABASE_URL` is correct in `.env`
- Verify SSL mode is set correctly (`?sslmode=require`)

### ImageKit Issues
- Verify all three ImageKit credentials are correct
- Check that the URL endpoint includes the full path with your ID

### Authentication Issues
- Make sure `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again
- Check that `NEXTAUTH_URL` matches your current URL

## Contributing

Feel free to open issues or submit pull requests to improve the application!

## License

MIT

## Support

For questions or support, please open an issue on the repository.

---

Built with ❤️ for the Eurorack community

