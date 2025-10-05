# Image Upload Feature

## Overview

Patches now support direct image uploads to ImageKit.io. All patch images are automatically stored in the `/patches` folder on your ImageKit account at `https://ik.imagekit.io/mywine/patches/`.

## How It Works

### User Experience

1. **Create/Edit Patch** - Navigate to create or edit a patch
2. **Upload Images** - Click the "Upload Image" button
3. **Select File** - Choose an image from your device (JPG, PNG, or WebP)
4. **Automatic Upload** - Image is uploaded to ImageKit with progress indicator
5. **Preview** - Uploaded images appear in a grid with remove buttons
6. **Save Patch** - Image URLs are automatically saved with the patch

### Technical Implementation

#### Components

**ImageUpload Component** (`components/ImageUpload.tsx`)
- Uses `imagekitio-react` SDK for uploads
- Handles multiple image uploads
- Shows upload progress
- Validates file type and size
- Stores images in `/patches` folder
- Provides image preview grid with remove functionality

**PatchForm Component** (`components/PatchForm.tsx`)
- Integrated with ImageUpload component
- Manages image array state
- Saves image URLs to database

#### Image Storage

**Location**: `https://ik.imagekit.io/mywine/patches/`
- All patch images are uploaded to this folder
- Unique filenames are automatically generated
- Images are publicly accessible via CDN

**Database**: PostgreSQL (`patches_patches` table)
- Image URLs stored as string array in `images` column
- Example: `["https://ik.imagekit.io/mywine/patches/abc123.jpg", "..."]`

## Features

### ✅ Upload Features
- **Drag and Drop**: Not implemented (manual selection only)
- **Multiple Uploads**: Yes - upload images one at a time
- **Progress Indicator**: Real-time upload progress bar
- **File Validation**: 
  - Supported formats: JPG, PNG, WebP
  - Max file size: 10MB per image
- **Automatic Naming**: Unique filenames generated automatically
- **Folder Organization**: All stored in `/patches` folder

### ✅ Management Features
- **Preview Grid**: Responsive grid layout (2-4 columns)
- **Remove Images**: Hover and click X button
- **Reorder**: Not implemented
- **Image Count**: Unlimited

### ✅ Display Features
- **Patch Detail Page**: Full-size images in gallery
- **Dashboard**: First image as thumbnail
- **Responsive**: Optimized for all devices

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="your_public_key"
IMAGEKIT_PRIVATE_KEY="your_private_key"
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/mywine"
```

### ImageKit Settings

**Folder Structure**:
```
/
├── patches/          ← All patch images stored here
│   ├── abc123.jpg
│   ├── def456.png
│   └── ...
└── (other folders for wine app, etc.)
```

**URL Format**:
```
https://ik.imagekit.io/mywine/patches/filename.jpg
```

### Security

- ✅ Images are uploaded with authentication
- ✅ Only authenticated users can upload
- ✅ Unique filenames prevent overwrites
- ✅ File type and size validation
- ⚠️ Images are publicly accessible (not private)

## API Integration

### Authentication Endpoint

**`/api/imagekit/auth`**
- Returns authentication parameters for ImageKit uploads
- Required by ImageKit SDK
- Server-side only (uses private key)

```typescript
GET /api/imagekit/auth
Response: {
  token: "...",
  expire: 1234567890,
  signature: "..."
}
```

### Upload Flow

1. User selects image
2. Client validates file (type, size)
3. Client requests auth from `/api/imagekit/auth`
4. Client uploads to ImageKit with auth params
5. ImageKit returns image URL
6. Client adds URL to images array
7. User saves patch with image URLs

## Usage Examples

### Basic Upload

```typescript
import { ImageUpload } from "@/components/ImageUpload";

function MyForm() {
  const [images, setImages] = useState<string[]>([]);
  
  return (
    <ImageUpload 
      images={images} 
      onImagesChange={setImages} 
    />
  );
}
```

### With Existing Images

```typescript
// Editing a patch with existing images
const [images, setImages] = useState<string[]>(patch?.images || []);

<ImageUpload images={images} onImagesChange={setImages} />
```

### Display Uploaded Images

```typescript
// Show images in a gallery
{images.map((url, idx) => (
  <img 
    key={idx}
    src={url} 
    alt={`Patch ${idx + 1}`}
    className="w-full h-64 object-cover"
  />
))}
```

## File Validation

### Client-Side Validation

```typescript
validateFile={(file) => {
  // Check file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    alert("Please upload a valid image file (JPG, PNG, or WebP)");
    return false;
  }
  
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    alert("Image size must be less than 10MB");
    return false;
  }
  
  return true;
}}
```

## Troubleshooting

### Upload Fails
- **Check ImageKit credentials** in `.env` file
- **Verify authentication endpoint** is accessible
- **Check file size** (must be under 10MB)
- **Check file type** (JPG, PNG, WebP only)

### Images Not Displaying
- **Verify URL format** starts with `https://ik.imagekit.io/`
- **Check ImageKit dashboard** to confirm upload
- **Check browser console** for CORS or network errors

### Authentication Error
- **Verify IMAGEKIT_PRIVATE_KEY** in `.env`
- **Restart dev server** after changing env variables
- **Check API route** `/api/imagekit/auth` is working

## Optimizations

### ImageKit Transformations

You can transform images on-the-fly using ImageKit URL parameters:

```typescript
// Resize to 300x300
`${imageUrl}?tr=w-300,h-300`

// Add quality optimization
`${imageUrl}?tr=w-800,q-80`

// Multiple transformations
`${imageUrl}?tr=w-500,h-500,fo-auto,q-80`
```

### Responsive Images

Future enhancement - generate srcset with multiple sizes:

```typescript
<img 
  src={imageUrl}
  srcSet={`
    ${imageUrl}?tr=w-400 400w,
    ${imageUrl}?tr=w-800 800w,
    ${imageUrl}?tr=w-1200 1200w
  `}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

## Future Enhancements

### Planned Features
- [ ] Drag and drop upload
- [ ] Multiple file selection
- [ ] Image reordering
- [ ] Image cropping/editing
- [ ] Lazy loading
- [ ] Automatic thumbnail generation
- [ ] Image metadata (title, description)
- [ ] Delete from ImageKit (currently only removes URL)

### Advanced Features
- [ ] Image transformations UI
- [ ] Focal point selection
- [ ] Zoom/lightbox view
- [ ] Image comparison slider
- [ ] Before/after views

## Summary

✅ **Implemented**:
- Direct upload to ImageKit
- Progress indicator
- File validation
- Multiple images
- Preview grid
- Remove functionality
- Automatic folder organization

🎯 **Benefits**:
- No manual URL copying
- Consistent storage location
- Better user experience
- CDN-optimized delivery
- Unique filenames prevent conflicts

---

**Ready to Use!** Just create or edit a patch and click "Upload Image" to add photos of your Eurorack setup! 🎛️📸

