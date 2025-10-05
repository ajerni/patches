# How to Get Hearthis.at Embed URL Manually

While we debug the automatic conversion, here's how to get the embed URL directly:

## Method 1: From Browser Developer Tools (Easiest)

1. **Go to your track page**: `https://hearthis.at/ernilab/patch1/`

2. **Right-click on the player** and select "Inspect" or "Inspect Element"

3. **Look for the iframe** in the HTML. You'll see something like:
   ```html
   <iframe id="hearthis_at_track_12835855" ...>
   ```

4. **Copy the number** from `hearthis_at_track_12835855` (in this case: `12835855`)

5. **Create the embed URL** using this format:
   ```
   https://app.hearthis.at/embed/TRACK_ID/transparent_black/?hcolor=&color=&style=2&block_size=2&block_space=1&background=1&waveform=0&cover=0&autoplay=0&css=
   ```

6. **Replace TRACK_ID** with the number you copied:
   ```
   https://app.hearthis.at/embed/12835855/transparent_black/?hcolor=&color=&style=2&block_size=2&block_space=1&background=1&waveform=0&cover=0&autoplay=0&css=
   ```

7. **Paste this URL** into your patch form

## Method 2: From Hearthis.at Share Button

1. **Go to your track page**

2. **Click the "Embed" or "Share" button** (usually below the player)

3. **Look for the embed code** - it will contain an iframe like:
   ```html
   <iframe src="https://app.hearthis.at/embed/12835855/..."></iframe>
   ```

4. **Copy the URL** from the `src` attribute

5. **Paste it** into your patch form

## Method 3: From URL Bar Trick

1. **Go to your track page**: `https://hearthis.at/ernilab/patch1/`

2. **View page source** (Right-click → "View Page Source" or Ctrl+U / Cmd+U)

3. **Search for** (Ctrl+F / Cmd+F): `hearthis_at_track_`

4. **You'll find**: `id="hearthis_at_track_12835855"`

5. **Copy the number** and create the embed URL as shown in Method 1

## Quick Reference

### Template:
```
https://app.hearthis.at/embed/TRACK_ID/transparent_black/?hcolor=&color=&style=2&block_size=2&block_space=1&background=1&waveform=0&cover=0&autoplay=0&css=
```

### Example:
- Track page: `https://hearthis.at/ernilab/patch1/`
- Track ID: `12835855`
- Embed URL: `https://app.hearthis.at/embed/12835855/transparent_black/?hcolor=&color=&style=2&block_size=2&block_space=1&background=1&waveform=0&cover=0&autoplay=0&css=`

## Using in Patches App

Once you have the embed URL:

1. **Create or edit** a patch
2. **Scroll to** "Audio Examples (hearthis.at)"
3. **Paste the embed URL** (the long one with `/embed/`)
4. **Click** the + button
5. **Save** the patch
6. **View the detail page** - you should see an embedded player!

## Testing the Automatic Conversion

After you manually add an embed URL, try the automatic conversion with debugging:

1. **Open browser console** (F12)
2. **Go to Console tab**
3. **Try adding a regular hearthis.at URL**
4. **Watch the console** for debug logs:
   - `idMatch: 12835855` ← Should show the track ID
   - `HTML Preview: ...` ← Shows the HTML received
   - `All 8-digit numbers found: ...` ← Shows potential IDs

This will help us fix the automatic conversion!

## Why Manual Works

The manual method always works because:
- ✅ You're providing the exact embed URL
- ✅ No HTML parsing needed
- ✅ Direct track ID
- ✅ No network requests

## Need Help?

If you're having trouble finding the track ID, share your hearthis.at URL and I can help extract it!

