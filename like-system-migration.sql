-- Migration script to add like system fields to existing database
-- Run these commands in your PostgreSQL database

-- 1. Add like_count column to patches_patches table
ALTER TABLE patches_patches ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- 2. Add index on like_count for performance (if not already exists)
CREATE INDEX IF NOT EXISTS idx_patches_like_count ON patches_patches(like_count);

-- 3. Create the patches_patch_likes table
CREATE TABLE IF NOT EXISTS patches_patch_likes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  patch_id TEXT NOT NULL REFERENCES patches_patches(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES patches_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one like per user per patch
  UNIQUE(patch_id, user_id)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_patch_likes_patch_id ON patches_patch_likes(patch_id);
CREATE INDEX IF NOT EXISTS idx_patch_likes_user_id ON patches_patch_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_patch_likes_created_at ON patches_patch_likes(created_at);
CREATE INDEX IF NOT EXISTS idx_patch_likes_patch_user ON patches_patch_likes(patch_id, user_id);

-- 5. Create index on like_count for sorting by popularity (public patches only)
CREATE INDEX IF NOT EXISTS idx_patches_like_count_public ON patches_patches(like_count) WHERE private = false;

-- 6. Create a function to update like counts (for maintaining consistency)
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

-- 7. Create triggers to automatically update like counts
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

-- 8. Initialize like counts for existing patches (if any)
-- This will set like_count to 0 for all existing patches
UPDATE patches_patches 
SET like_count = 0 
WHERE like_count IS NULL;

-- 9. Verify the migration
-- Run these queries to verify everything is working:

-- Check if like_count column exists and has default values
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'patches_patches' 
AND column_name = 'like_count';

-- Check if patches_patch_likes table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'patches_patch_likes';

-- Check if indexes were created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('patches_patch_likes', 'patches_patches')
AND indexname LIKE '%like%';

-- Check if triggers were created
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%like%';

-- Check foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'patches_patch_likes';

-- Check unique constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'patches_patch_likes' 
AND constraint_type = 'UNIQUE';
