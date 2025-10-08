-- Database optimization for shared patches search performance
-- Run these commands in your PostgreSQL database to optimize search performance

-- 1. Index for public patches filtering (most important)
CREATE INDEX IF NOT EXISTS idx_patches_private_updated ON patches_patches (private, "updatedAt" DESC) WHERE private = false;

-- 2. Index for public patches alphabetical sorting
CREATE INDEX IF NOT EXISTS idx_patches_private_title ON patches_patches (private, title) WHERE private = false;

-- 3. Full-text search index for titles and descriptions
CREATE INDEX IF NOT EXISTS idx_patches_title_search ON patches_patches USING gin(to_tsvector('english', title)) WHERE private = false;
CREATE INDEX IF NOT EXISTS idx_patches_description_search ON patches_patches USING gin(to_tsvector('english', description)) WHERE private = false;

-- 4. Index for tags array search (GIN index for array operations)
CREATE INDEX IF NOT EXISTS idx_patches_tags_gin ON patches_patches USING gin(tags) WHERE private = false;

-- 5. Index for user name search
CREATE INDEX IF NOT EXISTS idx_users_name_search ON patches_users USING gin(to_tsvector('english', name));

-- 6. Composite index for cursor-based pagination with search
CREATE INDEX IF NOT EXISTS idx_patches_private_updated_cursor ON patches_patches (private, "updatedAt" DESC, id) WHERE private = false;
CREATE INDEX IF NOT EXISTS idx_patches_private_title_cursor ON patches_patches (private, title, id) WHERE private = false;

-- 7. Index for patch modules relationship
CREATE INDEX IF NOT EXISTS idx_patch_modules_patch_id ON patch_modules ("patchId");

-- 8. Indexes for module name and manufacturer search
CREATE INDEX IF NOT EXISTS idx_modules_name_search ON patches_modules USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_modules_manufacturer_search ON patches_modules USING gin(to_tsvector('english', manufacturer));

-- 9. Composite index for patch-module joins
CREATE INDEX IF NOT EXISTS idx_patch_modules_module_patch ON patches_modules ("moduleId", "patchId");

-- Performance analysis queries (run these to check performance):
-- EXPLAIN ANALYZE SELECT DISTINCT p.*, u.name as user_name, u.id as user_id
-- FROM patches_patches p
-- JOIN patches_users u ON p."userId" = u.id
-- WHERE p.private = false
-- AND LOWER(p.title) LIKE LOWER('%ambient%')
-- ORDER BY p."updatedAt" DESC
-- LIMIT 20;

-- EXPLAIN ANALYZE SELECT DISTINCT p.*, u.name as user_name, u.id as user_id
-- FROM patches_patches p
-- JOIN patches_users u ON p."userId" = u.id
-- WHERE p.private = false
-- AND EXISTS (
--   SELECT 1 FROM unnest(p.tags) AS tag
--   WHERE LOWER(tag) LIKE LOWER('%bass%')
-- )
-- ORDER BY p."updatedAt" DESC
-- LIMIT 20;

-- EXPLAIN ANALYZE SELECT DISTINCT p.*, u.name as user_name, u.id as user_id
-- FROM patches_patches p
-- JOIN patches_users u ON p."userId" = u.id
-- WHERE p.private = false
-- AND EXISTS (
--   SELECT 1 FROM patch_modules pm
--   JOIN modules m ON pm."moduleId" = m.id
--   WHERE pm."patchId" = p.id
--   AND LOWER(m.name) LIKE LOWER('%vco%')
-- )
-- ORDER BY p."updatedAt" DESC
-- LIMIT 20;
