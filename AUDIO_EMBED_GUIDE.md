# Hearthis.at Audio Embed Feature

## Overview

Patches support embedded audio players from [hearthis.at](https://hearthis.at). Users can paste simple track URLs which are **automatically converted** to embedded players when viewing the patch.

## 🎯 Key Concept: "Store Simple, Display Smart"

- **In Form**: Users paste simple URLs like `https://hearthis.at/ernilab/patch1/`
- **In Database**: URLs stored as-is (clean and simple)
- **On Display**: Automatic conversion to embedded player happens on-the-fly!

## How to Add Audio

### ✨ Easiest Method (Recommended)

Just paste the **regular track URL** from your browser!

1. Upload your audio to hearthis.at
2. Copy the **track page URL**: `https://hearthis.at/ernilab/patch1/`
3. Paste it into the patches app
4. Click **+** to add
5. **That's it!** The conversion happens automatically when viewing

**Example:**
```
You paste: https://hearthis.at/ernilab/patch1/
Stored in DB: https://hearthis.at/ernilab/patch1/
On display: Automatically converted to embedded player!
```

### Alternative: Direct Embed URL

You can also paste embed URLs directly (both work):

```
https://app.hearthis.at/embed/12835855/transparent_black/?...
```

## Technical Architecture

### Flow Diagram

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────────┐
│  User Pastes    │ ───> │   Database   │ ───> │  Detail Page    │
│  Simple URL     │      │  Stores URL  │      │  Auto-Converts  │
└─────────────────┘      └──────────────┘      └─────────────────┘
                                                         │
                                                         ▼
                                                 ┌────────────────┐
                                                 │ Embedded Player│
                                                 └────────────────┘
```

### Components

#### 1. PatchForm.tsx (Input)
- **No conversion logic!**
- Simply stores whatever URL the user provides
- Fast and simple
- Database stores: `["https://hearthis.at/ernilab/patch1/"]`

#### 2. HearthisEmbed.tsx (Display)
- **Where the magic happens!**
- Receives URL from database
- Detects if conversion needed:
  ```typescript
  const needsConversion = 
    url.includes("hearthis.at/") && 
    !url.includes("app.hearthis.at/embed/");
  ```
- If needs conversion:
  - Shows loading spinner
  - Calls `/api/hearthis/convert`
  - Receives embed URL
  - Displays player
- If already embed URL:
  - Displays player immediately

#### 3. /api/hearthis/convert (API)
- **POST** endpoint
- **Input**: `{ url: "https://hearthis.at/ernilab/patch1/" }`
- **Process**:
  1. Fetches HTML from track page
  2. Extracts track ID using robust regex patterns:
     - `id="hearthis_at_track_(\d{7,})"` 
     - `app.hearthis.at/embed/(\d{7,})`
     - `data-track-id="(\d{7,})"`
     - `window.trackId = \d{7,}`
     - JSON-LD structured data
  3. Validates track ID (minimum 7 digits)
  4. Generates standardized embed URL
- **Output**: `{ embedUrl: "...", trackId: "12835855" }`

## Embedded Player Features

The embedded player includes:
- ✅ Play/pause controls
- ✅ Waveform visualization
- ✅ Volume control
- ✅ Progress bar
- ✅ Transparent dark theme
- ✅ Responsive design (100% width, 150px height)
- ✅ Rounded corners (10px border-radius)

## Benefits of This Approach

### ✅ Clean Database
- Stores simple, human-readable URLs
- Easy to understand and debug
- Small storage footprint
- Example: `https://hearthis.at/ernilab/patch1/`

### ✅ Flexible Display
- Conversion happens on-demand
- Can update conversion logic without changing database
- Works with both URL formats automatically
- Loading states provide good UX

### ✅ User-Friendly
- Users paste the URL they see in their browser
- No need to find embed codes or inspect HTML
- Works immediately (no waiting for conversion)
- Clear feedback (loading spinner, error messages)

### ✅ Robust
- Multiple regex patterns for track ID extraction
- Validation prevents false positives
- Extensive debugging logs in development
- Graceful error handling with fallback links

## Adding Audio to Patches

### When Creating/Editing a Patch

1. Scroll to **"Audio Examples (hearthis.at)"** section
2. Paste your hearthis.at URL:
   - `https://hearthis.at/ernilab/patch1/` ← Simple format
   - or `https://app.hearthis.at/embed/12835855/...` ← Also works
3. Click **+** button or press **Enter**
4. URL appears in the list
5. Add multiple tracks if needed
6. Click **"Create Patch"** or **"Update Patch"**

### Uploading to hearthis.at

1. Go to [hearthis.at](https://hearthis.at)
2. Sign in or create account (free)
3. Click "Upload"
4. Upload your patch audio file
5. Add title, description, tags
6. Publish the track
7. Copy the URL from your browser's address bar

## Display States

### Loading
```
┌─────────────────────────────────┐
│ 🔄 Loading audio player...      │
└─────────────────────────────────┘
```

### Success
```
┌─────────────────────────────────┐
│ ▶️  ━━━━━━━●────────  2:15     │
│ 🔊 ▂▄▆█▅▃▂ (waveform)          │
└─────────────────────────────────┘
```

### Error
```
┌─────────────────────────────────┐
│ ⚠️ Could not load audio player   │
│ Open on hearthis.at →            │
└─────────────────────────────────┘
```

## File Recommendations

- **Format**: MP3 or WAV
- **Length**: Under 5 minutes for quick loading
- **Quality**: 128-320 kbps MP3
- **Naming**: Use descriptive names on hearthis.at

## Troubleshooting

### Conversion Fails

**Problem**: "Could not extract track ID from URL"

**Solutions**:
1. Check track is public on hearthis.at
2. Verify URL is complete
3. Try the embed URL directly (see manual guide below)
4. Check browser console for debug logs

### Player Not Loading

**Problem**: Iframe shows blank or error

**Solutions**:
- Check track is published (not draft)
- Verify track isn't deleted
- Check browser console for errors
- Try opening URL in new tab

### Manual Conversion (If Automatic Fails)

See `HEARTHIS_MANUAL_EMBED.md` for step-by-step instructions on how to manually get the embed URL.

## Debugging

### Development Logs

When `NODE_ENV=development`, the API logs detailed information:

```
idMatch: 12835855
embedMatch: 12835855
dataMatch: null
jsMatch: null
HTML Preview: <html>...
All 8-digit numbers found: ['12835855', '12835856']
```

### Browser Console

Open DevTools (F12) to see:
- Conversion requests
- Track ID extraction results
- Error messages

## Example Use Cases

### 1. Ambient Drone Patch
```
Audio 1: https://hearthis.at/user/ambient-drone-full/
Audio 2: https://hearthis.at/user/filter-sweep-closeup/
Audio 3: https://hearthis.at/user/oscillator-modulation/
```

### 2. Rhythmic Sequence
```
Audio 1: https://hearthis.at/user/complete-sequence/
Audio 2: https://hearthis.at/user/drums-only/
Audio 3: https://hearthis.at/user/melody-only/
Audio 4: https://hearthis.at/user/with-effects/
```

### 3. Tutorial Patch
```
Audio 1: https://hearthis.at/user/final-result/
Audio 2: https://hearthis.at/user/step1-basic-rhythm/
Audio 3: https://hearthis.at/user/step2-adding-melody/
Audio 4: https://hearthis.at/user/step3-effects/
```

## Technical Details

### Embed URL Format

```
https://app.hearthis.at/embed/{TRACK_ID}/transparent_black/?hcolor=&color=&style=2&block_size=2&block_space=1&background=1&waveform=0&cover=0&autoplay=0&css=
```

### Parameters Explained
- `transparent_black`: Theme
- `style=2`: Compact player
- `waveform=0`: Hide waveform (cleaner look)
- `cover=0`: Hide cover art
- `autoplay=0`: Don't autoplay
- `height=150`: Fixed height in pixels

### Code Example

```typescript
// HearthisEmbed component
const needsConversion = 
  url.includes("hearthis.at/") && 
  !url.includes("app.hearthis.at/embed/");

if (needsConversion) {
  const response = await fetch("/api/hearthis/convert", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
  const { embedUrl } = await response.json();
  setEmbedUrl(embedUrl);
}
```

## Limitations

### Current Limitations

- ❌ No audio upload directly to the app
- ❌ No audio editing or processing
- ❌ Requires external hearthis.at account
- ❌ Depends on hearthis.at HTML structure (may break if they redesign)

### Why Use hearthis.at?

- ✅ Free hosting for audio
- ✅ Unlimited uploads
- ✅ Good quality streaming
- ✅ Waveform visualization
- ✅ Social features (likes, comments)
- ✅ No storage/bandwidth costs for you
- ✅ Embedded player included
- ✅ Reliable CDN

## Future Enhancements

### Planned Features

- [ ] Cache converted URLs to reduce API calls
- [ ] Preview audio in form before saving
- [ ] Customize player colors/theme
- [ ] Show/hide waveform option
- [ ] Download button
- [ ] Share audio directly from patch

### Advanced Features

- [ ] Direct audio upload (without hearthis.at)
- [ ] Audio editing/trimming
- [ ] Multiple audio format support
- [ ] Playlist mode for multiple tracks
- [ ] Audio visualization options
- [ ] Timestamp comments on waveform
- [ ] AI-generated patch notes from audio

## Summary

### ✅ What's Implemented

- ✅ Simple URL input (no complex embed codes needed)
- ✅ Clean database storage (human-readable URLs)
- ✅ **Automatic conversion on display** ⭐
- ✅ Loading states and error handling
- ✅ Multiple tracks per patch
- ✅ Beautiful embedded players
- ✅ Responsive design
- ✅ Robust track ID extraction
- ✅ Extensive debugging

### 🎯 Key Benefits

- **For Users**: Just paste and go!
- **For Database**: Clean, simple URLs
- **For Display**: Beautiful embedded players
- **For Maintenance**: Easy to update conversion logic

---

**Ready to Use!** Just paste your hearthis.at track URLs when creating patches! 🎛️🎵

The conversion happens automatically behind the scenes. ✨
