-- Create the junction table for patches and modules
CREATE TABLE IF NOT EXISTS patches_patch_modules (
    id TEXT PRIMARY KEY,
    patch_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT patches_patch_modules_patch_id_fkey FOREIGN KEY (patch_id) REFERENCES patches_patches(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT patches_patch_modules_module_id_fkey FOREIGN KEY (module_id) REFERENCES patches_modules(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT patches_patch_modules_patch_id_module_id_key UNIQUE (patch_id, module_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS patches_patch_modules_patch_id_idx ON patches_patch_modules(patch_id);
CREATE INDEX IF NOT EXISTS patches_patch_modules_module_id_idx ON patches_patch_modules(module_id);
