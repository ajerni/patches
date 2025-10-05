# Prisma Guide for Eurorack Patches

## What is Prisma?

Prisma is a **next-generation ORM (Object-Relational Mapping)** that makes database access easy and type-safe. Think of it as a bridge between your TypeScript code and your PostgreSQL database.

## Why We Use Prisma

### 1. **Type Safety**
```typescript
// Prisma knows your database structure
const patch = await prisma.patch.findUnique({
  where: { id: "abc123" }
})
// TypeScript knows 'patch' has title, description, tags, etc.
// Auto-completion works! ✨
```

### 2. **Easy Database Queries**
```typescript
// Instead of raw SQL:
"SELECT * FROM patches_patches WHERE userId = $1 ORDER BY updatedAt DESC"

// You write:
await prisma.patch.findMany({
  where: { userId: session.user.id },
  orderBy: { updatedAt: 'desc' }
})
```

### 3. **Automatic Migrations**
Prisma tracks changes to your database schema and creates migration files.

### 4. **Developer Experience**
- Auto-completion for all queries
- Type checking at compile time
- Clear error messages
- Built-in validation

## Understanding the Schema File

Let's break down `prisma/schema.prisma`:

### Generator and Datasource

```prisma
generator client {
  provider = "prisma-client-js"
}
```
**What it does:** Tells Prisma to generate a JavaScript/TypeScript client for querying.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
**What it does:** 
- Connects to PostgreSQL
- Reads connection string from `.env.local` file
- Works with your Render.com database

## Database Schema Explained

### User Model (Table: `patches_users`)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  patches       Patch[]
  
  @@map("patches_users")
}
```

**Field by Field:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier, auto-generated with `cuid()` |
| `email` | String | User's email, must be unique across all users |
| `name` | String | User's display name |
| `password` | String | Hashed password (bcryptjs) |
| `createdAt` | DateTime | Timestamp when user registered |
| `updatedAt` | DateTime | Auto-updates when user record changes |
| `patches` | Patch[] | Relation: all patches belonging to this user |

**Special Annotations:**
- `@id` - Primary key
- `@default(cuid())` - Auto-generate collision-resistant unique ID
- `@unique` - Enforces uniqueness (prevents duplicate emails)
- `@default(now())` - Sets current timestamp on creation
- `@updatedAt` - Automatically updates timestamp on any change
- `@@map("patches_users")` - Maps to table name `patches_users` in PostgreSQL

### Patch Model (Table: `patches_patches`)

```prisma
model Patch {
  id            String    @id @default(cuid())
  title         String
  description   String    @db.Text
  instructions  String?   @db.Text
  notes         String?   @db.Text
  tags          String[]  @default([])
  images        String[]  @default([])
  sounds        String[]  @default([])
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([userId])
  @@map("patches_patches")
}
```

**Field by Field:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier for the patch |
| `title` | String | Patch title (required) |
| `description` | String | Patch description (TEXT type for long content) |
| `instructions` | String? | Optional instructions (? means nullable) |
| `notes` | String? | Optional personal notes |
| `tags` | String[] | Array of tags (e.g., ["ambient", "drone"]) |
| `images` | String[] | Array of ImageKit.io URLs |
| `sounds` | String[] | Array of hearthis.at URLs |
| `userId` | String | Foreign key to the user who created it |
| `user` | User | Relation: the user who owns this patch |
| `createdAt` | DateTime | When patch was created |
| `updatedAt` | DateTime | When patch was last modified |

**Special Annotations:**
- `@db.Text` - Uses PostgreSQL TEXT type (unlimited length)
- `String?` - The `?` means this field is optional (can be null)
- `String[]` - Array type, stores multiple values
- `@default([])` - Empty array by default
- `@relation(fields: [userId], references: [id], onDelete: Cascade)` - Links to User, deletes patches when user is deleted
- `@@index([userId])` - Creates database index for faster queries by userId
- `@@map("patches_patches")` - Maps to table name `patches_patches` in PostgreSQL

## Database Tables Created

When you run `npx prisma db push`, these tables will be created in your Render.com PostgreSQL database:

### 1. `patches_users`
```sql
CREATE TABLE patches_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);
```

### 2. `patches_patches`
```sql
CREATE TABLE patches_patches (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  sounds TEXT[] DEFAULT '{}',
  "userId" TEXT NOT NULL REFERENCES patches_users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);

CREATE INDEX patches_patches_userId_idx ON patches_patches("userId");
```

## How We Use Prisma in the App

### 1. **Prisma Client** (`lib/prisma.ts`)

```typescript
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()
```

This creates a single instance of Prisma Client that we import everywhere.

### 2. **In API Routes** (Example: `app/api/patches/route.ts`)

```typescript
import { prisma } from "@/lib/prisma";

// Get all patches for a user
const patches = await prisma.patch.findMany({
  where: { userId: session.user.id },
  orderBy: { updatedAt: 'desc' }
});

// Create a new patch
const patch = await prisma.patch.create({
  data: {
    title: "My Patch",
    description: "...",
    userId: session.user.id,
    tags: ["ambient", "drone"]
  }
});

// Update a patch
const updated = await prisma.patch.update({
  where: { id: patchId },
  data: { title: "New Title" }
});

// Delete a patch
await prisma.patch.delete({
  where: { id: patchId }
});
```

## Common Prisma Operations

### Finding Records

```typescript
// Find one by ID
const patch = await prisma.patch.findUnique({
  where: { id: "abc123" }
});

// Find first match
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" }
});

// Find many with filters
const patches = await prisma.patch.findMany({
  where: {
    userId: "user123",
    tags: { has: "ambient" }
  },
  orderBy: { createdAt: 'desc' },
  take: 10 // limit to 10 results
});

// Include related data
const patch = await prisma.patch.findUnique({
  where: { id: "abc123" },
  include: {
    user: true // includes user data
  }
});
```

### Creating Records

```typescript
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    name: "John Doe",
    password: hashedPassword
  }
});

const patch = await prisma.patch.create({
  data: {
    title: "Ambient Drone",
    description: "A slowly evolving soundscape...",
    tags: ["ambient", "drone", "modular"],
    userId: user.id
  }
});
```

### Updating Records

```typescript
const patch = await prisma.patch.update({
  where: { id: patchId },
  data: {
    title: "Updated Title",
    tags: ["new", "tags"]
  }
});
```

### Deleting Records

```typescript
await prisma.patch.delete({
  where: { id: patchId }
});

// Cascade delete: When you delete a user,
// all their patches are automatically deleted
// because of onDelete: Cascade in the schema
await prisma.user.delete({
  where: { id: userId }
});
```

## Prisma Commands

### During Development

```bash
# Push schema to database (creates/updates tables)
npx prisma db push

# Generate Prisma Client (after schema changes)
npx prisma generate

# Open Prisma Studio (visual database browser)
npx prisma studio

# Format schema file
npx prisma format
```

### For Production

```bash
# Create a migration (version control for schema)
npx prisma migrate dev --name add_patches_table

# Apply migrations in production
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

## Prisma Studio

Prisma Studio is a visual database editor. Run it with:

```bash
npx prisma studio
```

Opens at `http://localhost:5555` - you can:
- View all records
- Create/edit/delete records
- Test queries
- Inspect relationships

## Why the "patches_" Prefix?

Adding a prefix to all tables is a good practice when:

1. **Shared Database** - Multiple apps use the same PostgreSQL instance
2. **Organization** - Easy to identify which tables belong to which app
3. **Avoiding Conflicts** - Prevents naming collisions
4. **Clarity** - Makes it obvious these tables are related

Your PostgreSQL database will have:
- `patches_users` (not just `users`)
- `patches_patches` (not just `patches`)

## Database Relationships

```
patches_users (1) ──────┐
                        │
                        │ ONE user
                        │ has MANY patches
                        │
                        └─────> patches_patches (many)
```

When you query:

```typescript
// Get user with all their patches
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" },
  include: { patches: true }
});

// Get patch with user info
const patch = await prisma.patch.findUnique({
  where: { id: "abc123" },
  include: { user: true }
});
```

## Security Features in Our Schema

1. **Cascade Delete** - When a user is deleted, their patches are automatically removed
2. **Unique Email** - Prevents duplicate accounts
3. **Index on userId** - Fast queries for user's patches
4. **Password Field** - Stores hashed passwords (never plain text)

## Next Steps

Now that you understand Prisma:

1. **Configure your `.env.local`** with DATABASE_URL
2. **Run**: `npx prisma db push` to create tables
3. **Run**: `npx prisma generate` to create the client
4. **Start coding!** - Prisma Client is ready to use

## Troubleshooting

### "Client not generated"
```bash
npx prisma generate
```

### "Cannot connect to database"
- Check your DATABASE_URL in `.env.local`
- Verify your Render.com database is active
- Ensure you have `?sslmode=require` in the URL

### "Table already exists"
```bash
# Reset and recreate
npx prisma db push --force-reset
```

### Need to see your data?
```bash
npx prisma studio
```

## Learn More

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

---

**Summary**: Prisma makes database access easy, type-safe, and fun! It auto-generates TypeScript code based on your schema, giving you great developer experience with auto-completion and type checking. All your tables will be prefixed with `patches_` to keep your database organized. 🎛️

