# Audio Embed Test

## Test These URLs

Try adding these URLs to a patch to test the embed functionality:

### ✅ Valid Embed URL (Should Work)
```
https://app.hearthis.at/embed/12835855/transparent_black/?hcolor=&color=&style=2&block_size=2&block_space=1&background=1&waveform=0&cover=0&autoplay=0&css=
```

**Expected Result**: Embedded audio player appears

### ✅ Regular Track URL (Auto-Convert)
```
https://hearthis.at/ernilab/patch1/
```

**Expected Result**: 
1. Shows "Converting..." 
2. Converts to embed URL
3. Embedded player appears on detail page

### ❌ Invalid Track ID
```
https://app.hearthis.at/embed/8/transparent_black/?...
```

**Expected Result**: Error or "Track not found"

## What to Check

### In Patch Form (when adding):
- [ ] "Converting..." appears for regular URLs
- [ ] No errors in console
- [ ] URL is added to list after conversion

### In Patch Detail Page:
- [ ] Audio Examples section appears
- [ ] Embedded iframe player shows (not just a link)
- [ ] Player has dark background
- [ ] Can click play and hear audio
- [ ] Console shows: `Track ID: 12835855`

## Browser Console Checks

### Good Logs:
```
HearthisEmbed - URL: https://app.hearthis.at/embed/12835855/..., Track ID: 12835855
Extracted track ID from embed URL: 12835855
```

### Bad Logs:
```
Could not extract track ID from URL: https://hearthis.at/...
Track ID: null
```

## Manual Test

1. Go to: http://localhost:3000
2. Login
3. Edit an existing patch or create new
4. Add audio URL: `https://hearthis.at/ernilab/patch1/`
5. Save patch
6. View patch detail
7. Look for embedded player (not link)

## If Links Still Appear Instead of Players

Check the database to see what's actually stored:

```sql
SELECT sounds FROM patches_patches WHERE id = 'your_patch_id';
```

Should return:
```json
[
  "https://app.hearthis.at/embed/12835855/transparent_black/..."
]
```

NOT:
```json
[
  "https://hearthis.at/ernilab/patch1/"
]
```

