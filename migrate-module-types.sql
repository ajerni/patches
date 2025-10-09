-- Migration: Change module type from single string to string array
-- This allows modules to have multiple types/categories like patches have multiple tags

-- Step 1: Add new types column as string array
ALTER TABLE patches_modules 
ADD COLUMN types TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Step 2: Migrate existing type data to types array
-- Convert single type values to array format
UPDATE patches_modules 
SET types = CASE 
  WHEN type IS NOT NULL AND type != '' THEN ARRAY[type]
  ELSE ARRAY[]::TEXT[]
END;

-- Step 3: Remove the old type column
ALTER TABLE patches_modules 
DROP COLUMN type;

-- Step 4: Add index for better query performance on types array
CREATE INDEX IF NOT EXISTS "patches_modules_types_idx" ON patches_modules USING GIN (types);

-- Verification query (run this to check the migration worked):
-- SELECT id, manufacturer, name, types FROM patches_modules LIMIT 5;
