-- Create patches_users table
CREATE TABLE IF NOT EXISTS patches_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create patches_patches table
CREATE TABLE IF NOT EXISTS patches_patches (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    sounds TEXT[] DEFAULT ARRAY[]::TEXT[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "patches_patches_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES patches_users(id) 
        ON DELETE CASCADE
);

-- Create patches_modules table
CREATE TABLE IF NOT EXISTS patches_modules (
    id TEXT PRIMARY KEY,
    manufacturer TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    notes TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "patches_modules_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES patches_users(id) 
        ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "patches_patches_userId_idx" ON patches_patches("userId");
CREATE INDEX IF NOT EXISTS "patches_modules_userId_idx" ON patches_modules("userId");

