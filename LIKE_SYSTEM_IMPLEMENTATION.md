# Like System for Shared Patches

## 🎯 Overview

A heart-based like system for shared patches that allows users to like/unlike public patches. Each user can like each patch only once.

## 📊 Database Schema

### **Tables Created:**

#### **1. `patches_patch_likes` Table:**
```sql
CREATE TABLE patches_patch_likes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  patch_id TEXT NOT NULL REFERENCES patches_patches(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES patches_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one like per user per patch
  UNIQUE(patch_id, user_id)
);
```

#### **2. Updated `patches_patches` Table:**
```sql
-- Added like count column for performance
ALTER TABLE patches_patches ADD COLUMN like_count INTEGER DEFAULT 0;
```

### **Key Features:**

- **✅ One Like Per User**: `UNIQUE(patch_id, user_id)` constraint
- **✅ Cascade Delete**: Likes are automatically deleted when patch or user is deleted
- **✅ Performance Optimized**: Denormalized `like_count` column for fast queries
- **✅ Auto-Update**: Triggers automatically maintain like counts
- **✅ Indexed**: Optimized for fast queries and sorting

## 🔧 Database Setup

### **Run These SQL Commands:**

```bash
# Run the complete setup
psql -d your_database -f like-system-schema.sql
```

### **What the SQL Does:**

1. **Creates the likes table** with proper constraints
2. **Adds like_count column** to patches table
3. **Creates performance indexes** for fast queries
4. **Sets up triggers** to auto-update like counts
5. **Initializes existing data** (if any patches already exist)

## 📈 Performance Optimizations

### **Indexes Created:**
```sql
-- Fast like count queries
CREATE INDEX idx_patch_likes_patch_id ON patches_patch_likes(patch_id);
CREATE INDEX idx_patch_likes_user_id ON patches_patch_likes(user_id);

-- Fast sorting by popularity
CREATE INDEX idx_patches_like_count ON patches_patches(like_count) WHERE private = false;

-- Fast user like checks
CREATE INDEX idx_patch_likes_patch_user ON patches_patch_likes(patch_id, user_id);
```

### **Auto-Update Triggers:**
```sql
-- Automatically increment like_count when like is added
CREATE TRIGGER trigger_update_like_count_insert
  AFTER INSERT ON patches_patch_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_patch_like_count();

-- Automatically decrement like_count when like is removed
CREATE TRIGGER trigger_update_like_count_delete
  AFTER DELETE ON patches_patch_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_patch_like_count();
```

## 🎨 UI Implementation Plan

### **Shared Patch Cards:**
- **Heart Icon**: Show like count with heart symbol (❤️)
- **Like Button**: Clickable heart to like/unlike
- **Visual Feedback**: Heart fills when liked, empty when not liked
- **Count Display**: Show number of likes next to heart

### **API Endpoints Needed:**
1. **`POST /api/patches/[id]/like`** - Like a patch
2. **`DELETE /api/patches/[id]/like`** - Unlike a patch
3. **`GET /api/patches/[id]/like-status`** - Check if user liked patch

### **Frontend Features:**
- **Real-time Updates**: Like count updates immediately
- **Optimistic UI**: Show changes before server confirmation
- **Error Handling**: Revert changes if server request fails
- **Loading States**: Show loading during like/unlike operations

## 🔍 Query Examples

### **Get Patches with Like Counts:**
```sql
SELECT p.*, u.name as user_name, u.id as user_id, p.like_count
FROM patches_patches p
JOIN patches_users u ON p."userId" = u.id
WHERE p.private = false
ORDER BY p.like_count DESC, p."updatedAt" DESC
LIMIT 20;
```

### **Check if User Liked Patch:**
```sql
SELECT EXISTS(
  SELECT 1 FROM patches_patch_likes
  WHERE patch_id = 'patch-id' AND user_id = 'user-id'
);
```

### **Get User's Liked Patches:**
```sql
SELECT p.*, pl.created_at as liked_at
FROM patches_patches p
JOIN patches_patch_likes pl ON p.id = pl.patch_id
WHERE pl.user_id = 'user-id' AND p.private = false
ORDER BY pl.created_at DESC;
```

## 🚀 Benefits

### **For Users:**
- **✅ Express Appreciation**: Show support for patches they like
- **✅ Discover Popular Patches**: See what the community loves
- **✅ Personal Collection**: Track patches they've liked
- **✅ Social Engagement**: More interactive community experience

### **For Patch Creators:**
- **✅ Feedback**: See which patches resonate with the community
- **✅ Motivation**: Recognition for their work
- **✅ Popularity Metrics**: Understand what works well
- **✅ Community Building**: Connect with users who appreciate their patches

### **For the Platform:**
- **✅ Engagement**: Increased user interaction
- **✅ Content Discovery**: Popular patches surface naturally
- **✅ Community Building**: Stronger user connections
- **✅ Analytics**: Understand user preferences

## 📊 Expected Performance

### **Query Performance:**
- **Like Count**: ~1-5ms (indexed column)
- **Like Check**: ~1-3ms (unique index)
- **Popular Patches**: ~5-10ms (indexed sorting)
- **User Likes**: ~10-20ms (indexed user query)

### **Scalability:**
- **Thousands of Patches**: Excellent performance
- **Tens of Thousands of Likes**: Fast queries
- **Hundreds of Users**: No performance issues
- **Real-time Updates**: Optimistic UI for instant feedback

## 🔒 Security Considerations

- **Authentication Required**: Only logged-in users can like
- **Rate Limiting**: Prevent spam liking (implement in API)
- **Validation**: Ensure patch exists and is public
- **Cascade Delete**: Automatic cleanup when users/patches deleted

## 📝 Next Steps

1. **Run Database Setup**: Execute the SQL commands
2. **Update Prisma Client**: `npx prisma generate`
3. **Create API Endpoints**: Implement like/unlike functionality
4. **Update Frontend**: Add heart icons and like buttons
5. **Test Functionality**: Ensure everything works correctly

The like system is designed to be performant, scalable, and user-friendly! 🎉
