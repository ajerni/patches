-- Database indexes for module search optimization
-- Run these commands in your PostgreSQL database

-- 1. Indexes for module name and manufacturer search
CREATE INDEX IF NOT EXISTS idx_patches_modules_name_search ON patches_modules USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_patches_modules_manufacturer_search ON patches_modules USING gin(to_tsvector('english', manufacturer));

-- 2. Composite index for patch-module joins (optimize the relationship queries)
CREATE INDEX IF NOT EXISTS idx_patches_patch_modules_module_patch ON patches_patch_modules ("module_id", "patch_id");

-- 3. Additional index for reverse lookup (patch to modules)
CREATE INDEX IF NOT EXISTS idx_patches_patch_modules_patch_module ON patches_patch_modules ("patch_id", "module_id");

-- 4. Index for module name and manufacturer for exact matches
CREATE INDEX IF NOT EXISTS idx_patches_modules_name_lower ON patches_modules (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_patches_modules_manufacturer_lower ON patches_modules (LOWER(manufacturer));

-- Performance test queries (run these to verify the indexes are working):
-- EXPLAIN ANALYZE SELECT DISTINCT p.*, u.name as user_name, u.id as user_id
-- FROM patches_patches p
-- JOIN patches_users u ON p."userId" = u.id
-- WHERE p.private = false
-- AND EXISTS (
--   SELECT 1 FROM patches_patch_modules pm
--   JOIN patches_modules m ON pm."module_id" = m.id
--   WHERE pm."patch_id" = p.id
--   AND LOWER(m.name) LIKE LOWER('%vco%')
-- )
-- ORDER BY p."updatedAt" DESC
-- LIMIT 20;

-- EXPLAIN ANALYZE SELECT DISTINCT p.*, u.name as user_name, u.id as user_id
-- FROM patches_patches p
-- JOIN patches_users u ON p."userId" = u.id
-- WHERE p.private = false
-- AND EXISTS (
--   SELECT 1 FROM patches_patch_modules pm
--   JOIN patches_modules m ON pm."module_id" = m.id
--   WHERE pm."patch_id" = p.id
--   AND LOWER(m.manufacturer) LIKE LOWER('%moog%')
-- )
-- ORDER BY p."updatedAt" DESC
-- LIMIT 20;
