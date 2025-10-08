-- Complete migration script to match Prisma schema exactly
-- Run these commands in your PostgreSQL database

-- 1. Add like_count column to patches_patches table
ALTER TABLE patches_patches ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- 2. Create the patches_patch_likes table (this creates the 'likes' relation for patches_patches)
CREATE TABLE IF NOT EXISTS patches_patch_likes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  patch_id TEXT NOT NULL REFERENCES patches_patches(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES patches_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one like per user per patch (matches @@unique([patchId, userId]) in Prisma)
  UNIQUE(patch_id, user_id)
);

-- 3. Create all indexes as specified in Prisma schema

-- Indexes for patches_patches table
CREATE INDEX IF NOT EXISTS idx_patches_user_id ON patches_patches("userId");
CREATE INDEX IF NOT EXISTS idx_patches_private ON patches_patches(private);
CREATE INDEX IF NOT EXISTS idx_patches_like_count ON patches_patches(like_count);

-- Indexes for patches_patch_likes table (matches Prisma @@index directives)
CREATE INDEX IF NOT EXISTS idx_patch_likes_patch_id ON patches_patch_likes(patch_id);
CREATE INDEX IF NOT EXISTS idx_patch_likes_user_id ON patches_patch_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_patch_likes_created_at ON patches_patch_likes(created_at);

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_patches_like_count_public ON patches_patches(like_count) WHERE private = false;

-- 4. Create function to update like counts (for maintaining consistency)
CREATE OR REPLACE FUNCTION update_patch_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE patches_patches 
    SET like_count = like_count + 1 
    WHERE id = NEW.patch_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE patches_patches 
    SET like_count = like_count - 1 
    WHERE id = OLD.patch_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 5. Create triggers to automatically update like counts
DROP TRIGGER IF EXISTS trigger_update_like_count_insert ON patches_patch_likes;
CREATE TRIGGER trigger_update_like_count_insert
  AFTER INSERT ON patches_patch_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_patch_like_count();

DROP TRIGGER IF EXISTS trigger_update_like_count_delete ON patches_patch_likes;
CREATE TRIGGER trigger_update_like_count_delete
  AFTER DELETE ON patches_patch_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_patch_like_count();

-- 6. Initialize like counts for existing patches
UPDATE patches_patches 
SET like_count = 0 
WHERE like_count IS NULL;

-- 7. Verify the migration matches Prisma schema

-- Check patches_patches table structure
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'patches_patches' 
ORDER BY ordinal_position;

-- Check patches_patch_likes table structure
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'patches_patch_likes' 
ORDER BY ordinal_position;

-- Check foreign key constraints (these create the Prisma relations)
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'patches_patch_likes'
ORDER BY tc.table_name, kcu.column_name;

-- Check unique constraints (matches @@unique([patchId, userId]))
SELECT 
    constraint_name, 
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'patches_patch_likes' 
AND constraint_type = 'UNIQUE';

-- Check all indexes (matches @@index directives in Prisma)
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('patches_patches', 'patches_patch_likes')
AND indexname LIKE '%patch%' OR indexname LIKE '%like%'
ORDER BY tablename, indexname;

-- Check triggers
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name LIKE '%like%'
ORDER BY trigger_name;

-- 8. Test the relations work correctly
-- This query should work after the migration (tests the 'likes' relation)
SELECT 
    p.id as patch_id,
    p.title,
    p.like_count,
    COUNT(pl.id) as actual_like_count
FROM patches_patches p
LEFT JOIN patches_patch_likes pl ON p.id = pl.patch_id
GROUP BY p.id, p.title, p.like_count
LIMIT 5;

-- This query should work after the migration (tests the 'patchLikes' relation)
SELECT 
    u.id as user_id,
    u.name,
    COUNT(pl.id) as total_likes_given
FROM patches_users u
LEFT JOIN patches_patch_likes pl ON u.id = pl.user_id
GROUP BY u.id, u.name
LIMIT 5;
