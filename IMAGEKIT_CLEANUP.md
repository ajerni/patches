# ImageKit Automatic Cleanup

## Overview

When patches or modules are deleted, their associated ImageKit images are now automatically deleted to prevent orphaned files and reduce storage costs.

---

## What Was Implemented

### 1. **Helper Functions** (`lib/imagekit.ts`)

#### `deleteImageKitFile(url: string)`
- Deletes a single image from ImageKit by its URL
- Searches for the file on ImageKit by filename and path
- Handles cases where file might already be deleted
- Returns `true` if successful or file not found, `false` on error

#### `deleteImageKitFiles(urls: string[])`
- Deletes multiple images in parallel
- Uses `Promise.allSettled()` to ensure all deletions are attempted even if some fail
- Non-blocking - doesn't throw errors

### 2. **Patch Deletion** (`app/api/patches/[id]/route.ts`)

When a patch is deleted, the following images are cleaned up:
- ✅ All images in the `images` array
- ✅ Patch schema image (if exists in `schema.imageUrl`)

### 3. **Module Deletion** (`app/api/modules/[id]/route.ts`)

When a module is deleted, the following images are cleaned up:
- ✅ All images in the `images` array

---

## How It Works

### Flow:

1. **User deletes a patch/module** via the API
2. **API fetches the record** from the database
3. **API verifies ownership** (authentication/authorization)
4. **API collects all ImageKit URLs** from the record
5. **API deletes the database record** (cascade deletes relations)
6. **API triggers ImageKit cleanup** (fire-and-forget, async)
7. **API returns success** to the user immediately

### Fire-and-Forget Strategy:

The ImageKit deletion happens asynchronously and doesn't block the API response:

```typescript
if (imagesToDelete.length > 0) {
  deleteImageKitFiles(imagesToDelete).catch(error => {
    console.error('Failed to delete some ImageKit files', error);
  });
}
```

**Why?**
- ✅ Faster API response time
- ✅ Better user experience (no waiting)
- ✅ Resilient (database deletion succeeds even if ImageKit fails)
- ✅ Errors are logged but don't affect the user

---

## Image URL Lookup Process

Since we only store URLs (not fileIds) in the database, the deletion process:

1. **Extracts filename** from the URL
2. **Searches ImageKit** by filename using `searchQuery`
3. **Matches exact URL** from search results
4. **Falls back to path search** if exact match not found
5. **Deletes by fileId** once found
6. **Logs** the result

---

## Error Handling

### Graceful Failures:

- ✅ If file not found on ImageKit → logged as success (already deleted)
- ✅ If search fails → logged as warning, continues with other files
- ✅ If deletion fails → logged as error, doesn't affect database
- ✅ All errors are logged to console for monitoring

### What Gets Logged:

```typescript
// Success
"Successfully deleted ImageKit file: filename.jpg fileId: xyz123"

// Already deleted
"File already deleted or not found on ImageKit: https://..."

// Warning
"Could not find file to delete on ImageKit: https://..."

// Error
"Error deleting ImageKit file: https://... [error details]"
```

---

## Testing

### To test the feature:

1. **Create a patch or module** with images
2. **Note the ImageKit URLs** in the browser console
3. **Delete the patch/module** via the UI
4. **Check server logs** for deletion messages
5. **Verify on ImageKit dashboard** that files are deleted

### Test Cases:

- ✅ Delete patch with multiple images
- ✅ Delete module with images
- ✅ Delete patch with schema image
- ✅ Delete patch/module with no images (should work fine)
- ✅ Delete already-deleted patch (files already gone from ImageKit)

---

## Limitations & Considerations

### Current Limitations:

1. **No Rollback**: If database deletion succeeds but ImageKit deletion fails, the database record is still deleted. Images become orphaned but will eventually be cleaned up on retry or manually.

2. **Search Performance**: For accounts with many files, the search by filename might be slow. Consider implementing a cleanup job that runs periodically.

3. **No FileId Storage**: We only store URLs, not fileIds. This requires searching ImageKit to find the file before deletion. **Future improvement**: Store fileIds in database for faster deletion.

4. **Race Conditions**: If multiple users try to delete the same file simultaneously, one will succeed and others will get "not found" (which is handled gracefully).

### When Updates Happen:

**✅ IMPLEMENTED**: When a user updates (PUT) a patch/module and removes images, those images are now automatically deleted from ImageKit.

**How it works:**
1. Compare old images vs new images
2. Identify removed URLs
3. Delete them from ImageKit (fire-and-forget)
4. Update the database record

**What gets cleaned up on update:**
- ✅ Removed patch images
- ✅ Removed module images  
- ✅ Removed patch schema images

---

## Future Improvements

### Recommended:

1. **Store FileIds**: Update the database schema to store ImageKit fileIds alongside URLs
   ```typescript
   interface ImageData {
     url: string;
     fileId: string;
   }
   ```

2. **Batch Cleanup Job**: Create a scheduled job that finds and deletes orphaned images:
   - Find all ImageKit files not referenced in database
   - Delete files older than X days
   - Run weekly

3. **✅ Cleanup on Update**: When images are removed during updates, delete them from ImageKit - **COMPLETED**

4. **User Storage Tracking**: Track storage usage per user and display in UI

5. **Manual Cleanup Tool**: Admin UI to view and clean up orphaned files

---

## Monitoring

### What to Monitor:

1. **Server Logs**: Check for deletion errors
2. **ImageKit Dashboard**: Monitor storage usage trends
3. **Database vs ImageKit**: Periodically audit for orphaned files

### Metrics to Track:

- Number of deletion attempts
- Success rate of deletions
- Time taken for deletion operations
- Storage usage over time

---

## API Rate Limits

ImageKit has API rate limits:
- Free tier: 500 requests/minute
- Paid tiers: Higher limits

The current implementation deletes files one at a time, which is safe for rate limits. If you need to delete large batches, consider:
- Adding rate limiting
- Batching deletions
- Using a queue system

---

## Troubleshooting

### "Could not find file to delete on ImageKit"

**Causes:**
- File was already deleted manually
- URL changed or is incorrect
- ImageKit path configuration mismatch
- Network/API error

**Solution:**
- Check server logs for full error
- Verify ImageKit credentials are correct
- Check ImageKit dashboard to see if file exists
- These warnings are normal and don't affect functionality

### Images still showing after deletion

**Causes:**
- Browser cache
- CDN cache (ImageKit CDN)

**Solution:**
- Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
- Wait a few minutes for CDN cache to expire
- Verify file is actually deleted in ImageKit dashboard

### Slow deletion

**Causes:**
- Large number of files
- Search performance in ImageKit
- Network latency

**Solution:**
- This is why we use fire-and-forget (doesn't block user)
- Consider implementing batch cleanup job
- Consider storing fileIds for faster deletion

---

## Security

### Protected:

- ✅ Only authenticated users can delete
- ✅ Only the owner of the patch/module can delete it
- ✅ ImageKit API credentials are server-side only
- ✅ No direct file deletion from client

### Not Vulnerable To:

- ❌ Unauthorized deletion (requires authentication + ownership)
- ❌ Malicious file deletion (all deletions are scoped to the resource)
- ❌ Exposure of API keys (server-side only)

---

## Summary

✅ **Automatic cleanup is now enabled**
✅ **Orphaned files are minimized**
✅ **Storage costs are reduced**
✅ **User experience is unaffected**
✅ **Error handling is robust**

The system will now automatically clean up ImageKit files when patches or modules are deleted. Errors are gracefully handled and logged for monitoring.

