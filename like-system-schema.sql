-- Like system for shared patches
-- Run these commands in your PostgreSQL database

-- 1. Create the likes table
CREATE TABLE IF NOT EXISTS patches_patch_likes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  patch_id TEXT NOT NULL REFERENCES patches_patches(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES patches_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one like per user per patch
  UNIQUE(patch_id, user_id)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_patch_likes_patch_id ON patches_patch_likes(patch_id);
CREATE INDEX IF NOT EXISTS idx_patch_likes_user_id ON patches_patch_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_patch_likes_created_at ON patches_patch_likes(created_at);

-- 3. Create a composite index for the unique constraint (already covered by UNIQUE constraint, but good for queries)
CREATE INDEX IF NOT EXISTS idx_patch_likes_patch_user ON patches_patch_likes(patch_id, user_id);

-- 4. Add a like count column to patches table for performance (denormalized)
ALTER TABLE patches_patches ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- 5. Create index on like_count for sorting by popularity
CREATE INDEX IF NOT EXISTS idx_patches_like_count ON patches_patches(like_count) WHERE private = false;

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
UPDATE patches_patches 
SET like_count = (
  SELECT COUNT(*) 
  FROM patches_patch_likes 
  WHERE patch_id = patches_patches.id
);

-- 9. Performance analysis queries (run these to check performance):
-- EXPLAIN ANALYZE SELECT p.*, u.name as user_name, u.id as user_id
-- FROM patches_patches p
-- JOIN patches_users u ON p."userId" = u.id
-- WHERE p.private = false
-- ORDER BY p.like_count DESC, p."updatedAt" DESC
-- LIMIT 20;

-- EXPLAIN ANALYZE SELECT COUNT(*) as like_count
-- FROM patches_patch_likes
-- WHERE patch_id = 'some-patch-id';

-- EXPLAIN ANALYZE SELECT EXISTS(
--   SELECT 1 FROM patches_patch_likes
--   WHERE patch_id = 'some-patch-id' AND user_id = 'some-user-id'
-- );
