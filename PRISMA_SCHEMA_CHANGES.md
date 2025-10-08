# Prisma Schema Changes for Like System

## 📊 **Changes Made to Prisma Schema**

### **1. User Model Changes:**
```prisma
model User {
  // ... existing fields ...
  patchLikes            PatchLike[]  // NEW: Relation to likes
}
```

**Database Impact:** No new columns needed in `patches_users` table. This is just a Prisma relation that uses the existing `user_id` foreign key in the `patches_patch_likes` table.

### **2. Patch Model Changes:**
```prisma
model Patch {
  // ... existing fields ...
  likeCount     Int           @default(0) @map("like_count")  // NEW: Like count column
  likes         PatchLike[]   // NEW: Relation to likes
}
```

**Database Impact:** 
- **New Column**: `like_count INTEGER DEFAULT 0` in `patches_patches` table
- **New Index**: `idx_patches_like_count` for performance
- **New Relation**: Uses existing `patch_id` foreign key in `patches_patch_likes` table

### **3. New PatchLike Model:**
```prisma
model PatchLike {
  id        String   @id @default(cuid())
  patchId   String   @map("patch_id")
  userId    String   @map("user_id")
  patch     Patch    @relation(fields: [patchId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")
  
  @@unique([patchId, userId])
  @@index([patchId])
  @@index([userId])
  @@index([createdAt])
  @@map("patches_patch_likes")
}
```

**Database Impact:** 
- **New Table**: `patches_patch_likes` with all the specified columns
- **Foreign Keys**: References to `patches_patches` and `patches_users`
- **Unique Constraint**: `UNIQUE(patch_id, user_id)` - one like per user per patch
- **Indexes**: For performance on common queries

## 🔧 **Database Migration Required**

### **What You Need to Run:**
```bash
# Execute the migration script
psql -d your_database -f like-system-migration.sql
```

### **What the Migration Does:**

#### **1. Adds New Column:**
```sql
ALTER TABLE patches_patches ADD COLUMN like_count INTEGER DEFAULT 0;
```

#### **2. Creates New Table:**
```sql
CREATE TABLE patches_patch_likes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  patch_id TEXT NOT NULL REFERENCES patches_patches(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES patches_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(patch_id, user_id)
);
```

#### **3. Creates Performance Indexes:**
```sql
-- For like_count queries
CREATE INDEX idx_patches_like_count ON patches_patches(like_count);
CREATE INDEX idx_patches_like_count_public ON patches_patches(like_count) WHERE private = false;

-- For likes table queries
CREATE INDEX idx_patch_likes_patch_id ON patches_patch_likes(patch_id);
CREATE INDEX idx_patch_likes_user_id ON patches_patch_likes(user_id);
CREATE INDEX idx_patch_likes_created_at ON patches_patch_likes(created_at);
CREATE INDEX idx_patch_likes_patch_user ON patches_patch_likes(patch_id, user_id);
```

#### **4. Sets Up Auto-Update Triggers:**
```sql
-- Automatically maintain like_count when likes are added/removed
CREATE TRIGGER trigger_update_like_count_insert
  AFTER INSERT ON patches_patch_likes
  FOR EACH ROW EXECUTE FUNCTION update_patch_like_count();

CREATE TRIGGER trigger_update_like_count_delete
  AFTER DELETE ON patches_patch_likes
  FOR EACH ROW EXECUTE FUNCTION update_patch_like_count();
```

## 🔗 **Relations Explained**

### **User ↔ PatchLike (One-to-Many):**
- **User** can have many **PatchLike** records
- **PatchLike** belongs to one **User**
- Uses `user_id` foreign key in `patches_patch_likes` table

### **Patch ↔ PatchLike (One-to-Many):**
- **Patch** can have many **PatchLike** records (many users can like it)
- **PatchLike** belongs to one **Patch**
- Uses `patch_id` foreign key in `patches_patch_likes` table

### **User ↔ Patch (Many-to-Many through PatchLike):**
- **User** can like many **Patches**
- **Patch** can be liked by many **Users**
- Junction table: `patches_patch_likes`

## ✅ **After Migration**

### **Prisma Client Generation:**
```bash
npx prisma generate
```

### **Database Push (if using Prisma migrations):**
```bash
npx prisma db push
```

### **Verification:**
The migration script includes verification queries to ensure everything was created correctly.

## 🎯 **Key Benefits**

1. **Performance**: Denormalized `like_count` for fast queries
2. **Consistency**: Auto-update triggers maintain accurate counts
3. **Integrity**: Foreign key constraints and unique constraints
4. **Scalability**: Proper indexes for large datasets
5. **Relations**: Clean Prisma relations for easy querying

The like system is now fully integrated with your existing database schema! 🎉
