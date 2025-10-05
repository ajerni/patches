# Modules Used in Patches - Complete Feature Implementation

## ✅ Overview

This feature allows users to link modules from their collection to patches, creating a many-to-many relationship between patches and modules. Users can see which modules are used in each patch, and conversely, which patches use a specific module.

## 🎯 Key Features

### For Patches
- ✅ Select multiple modules when creating/editing a patch
- ✅ Display modules used in patch detail view with images
- ✅ Click module cards to view module details
- ✅ Visual indicators (chips/badges) for selected modules

### For Modules
- ✅ See which patches use each module
- ✅ Display patch cards with thumbnails
- ✅ Click patch cards to view patch details
- ✅ Show count of patches using the module

## 📊 Database Structure

### Junction Table
```sql
CREATE TABLE patches_patch_modules (
  id TEXT PRIMARY KEY,
  patch_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_patch FOREIGN KEY (patch_id) REFERENCES patches_patches(id) ON DELETE CASCADE,
  CONSTRAINT fk_module FOREIGN KEY (module_id) REFERENCES patches_modules(id) ON DELETE CASCADE,
  CONSTRAINT unique_patch_module UNIQUE(patch_id, module_id)
);
```

### Key Features
- **Many-to-many relationship**: One patch can use multiple modules, one module can be in multiple patches
- **CASCADE DELETE**: If a patch or module is deleted, relationships are automatically removed
- **UNIQUE constraint**: Prevents adding the same module to a patch twice
- **Indexes**: Fast lookups in both directions

## 📝 Implementation Details

### 1. Prisma Schema Updates

**File**: `prisma/schema.prisma`

```prisma
model Patch {
  // ... existing fields
  patchModules  PatchModule[]  // NEW: Relationship to modules
}

model Module {
  // ... existing fields
  patchModules  PatchModule[]  // NEW: Relationship to patches
}

model PatchModule {
  id        String   @id @default(cuid())
  patchId   String
  moduleId  String
  patch     Patch    @relation(fields: [patchId], references: [id], onDelete: Cascade)
  module    Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  
  @@unique([patchId, moduleId])
  @@index([patchId])
  @@index([moduleId])
  @@map("patches_patch_modules")
}
```

### 2. API Routes

#### Patch Creation (`POST /api/patches`)
```typescript
const { moduleIds, ...patchData } = req.body;

const patch = await prisma.patch.create({
  data: {
    ...patchData,
    userId: session.user.id,
    patchModules: {
      create: moduleIds.map((moduleId) => ({ moduleId })),
    },
  },
  include: {
    patchModules: {
      include: { module: true },
    },
  },
});
```

#### Patch Retrieval (`GET /api/patches/:id`)
```typescript
const patch = await prisma.patch.findUnique({
  where: { id: params.id },
  include: {
    user: { select: { name: true, email: true } },
    patchModules: {
      include: { module: true },
    },
  },
});
```

#### Patch Update (`PUT /api/patches/:id`)
```typescript
const patch = await prisma.patch.update({
  where: { id: params.id },
  data: {
    ...patchData,
    patchModules: {
      deleteMany: {},  // Remove old relationships
      create: moduleIds.map((moduleId) => ({ moduleId })),
    },
  },
});
```

### 3. Module Selector Component

**File**: `components/ModuleSelector.tsx`

**Features**:
- Search/filter modules by manufacturer, name, or type
- Multi-select dropdown with checkmarks
- Selected modules displayed as removable chips
- Responsive design with click-outside-to-close
- Shows count of selected modules
- Handles empty state (no modules in collection)

**UI Elements**:
```
┌─────────────────────────────────────┐
│ ☒ Mutable Inst. - Plaits           │ ← Selected chips
│ ☒ Make Noise - Maths                │
│ ☒ Intellijel - Quad VCA             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🔍 Search modules...                │ ← Search input
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ □ Mutable Instruments - Rings       │
│   Resonator                          │ ← Dropdown options
│ ✓ Mutable Instruments - Plaits      │
│   Macro Oscillator                   │
└─────────────────────────────────────┘
```

### 4. PatchForm Integration

**File**: `components/PatchForm.tsx`

**Changes**:
- Added `moduleIds` state
- Extract module IDs from `patch.patchModules` when editing
- Include `ModuleSelector` component after Description field
- Send `moduleIds` array in form submission

**Form Section**:
```tsx
{/* Modules Used */}
<div>
  <label>Modules Used</label>
  <p>Select which modules from your collection are used in this patch</p>
  <ModuleSelector 
    selectedModuleIds={moduleIds}
    onModulesChange={setModuleIds}
  />
</div>
```

### 5. Patch Detail Page

**File**: `app/patches/[id]/page.tsx`

**Display**:
- Grid layout (1-3 columns responsive)
- Module cards with:
  - Module image (or placeholder icon)
  - Module name & manufacturer
  - Type badge
  - Hover effects (border change, shadow, zoom)
  - Click to view module details

**Example**:
```
🔧 Modules Used

┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  [Image]      │  │  [Image]      │  │  [Image]      │
│  Plaits       │  │  Maths        │  │  Quad VCA     │
│  Mutable Inst │  │  Make Noise   │  │  Intellijel   │
│  [Oscillator] │  │  [Function]   │  │  [VCA]        │
└───────────────┘  └───────────────┘  └───────────────┘
```

### 6. Module Detail Page

**File**: `app/modules/[id]/page.tsx`

**Display**:
- "Used in Patches" section showing patch cards
- Patch count in header
- Grid layout with patch thumbnails
- Patch title, description preview, and tags
- Click to view patch details

**Example**:
```
🎵 Used in Patches (3)

┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  [Image]      │  │  [Image]      │  │  [Image]      │
│  Ambient Drone│  │  Rhythmic Seq │  │  Bass Patch   │
│  Creates...   │  │  Four-voice...│  │  Deep bass... │
│  [ambient]    │  │  [rhythm]     │  │  [bass]       │
└───────────────┘  └───────────────┘  └───────────────┘
```

## 🎨 UI/UX Features

### Module Selector
- **Search**: Real-time filtering
- **Visual feedback**: Checkmarks for selected items
- **Chips**: Easy removal of selected modules
- **Dropdown**: Click outside to close
- **Empty state**: Prompts user to add modules first
- **Counter**: Shows number of selected modules

### Patch Detail - Modules Section
- **Responsive grid**: 1/2/3 columns based on screen size
- **Module cards**:
  - Image with fallback icon
  - Hover effects (border, shadow, image zoom)
  - Clear typography hierarchy
  - Type badge for categorization
- **Click through**: Direct link to module details

### Module Detail - Patches Section
- **Patch count**: Clear indication in header
- **Patch cards**:
  - Thumbnail with fallback
  - Title and description preview
  - Up to 2 tags shown (+ more indicator)
  - Hover effects for interactivity
- **Click through**: Direct link to patch details

## 📱 Responsive Design

### Mobile (< 640px)
- Single column layout
- Full-width cards
- Touch-friendly hit areas
- Stacked chips

### Tablet (640px - 768px)
- 2-column grid for modules/patches
- Medium-sized cards
- Comfortable spacing

### Desktop (> 768px)
- 3-column grid for optimal use of space
- Larger cards with more details
- Hover effects enabled

## 🔄 Data Flow

### Creating a Patch with Modules
```
1. User fills patch form
2. User searches and selects modules
3. Selected modules shown as chips
4. User clicks "Create Patch"
5. Frontend sends: { ...patchData, moduleIds: ["id1", "id2"] }
6. Backend creates patch and relationships
7. User redirected to patch detail page
8. Modules displayed with full details
```

### Editing a Patch's Modules
```
1. User opens patch edit page
2. API fetches patch with patchModules.module
3. ModuleSelector pre-selects current modules
4. User adds/removes modules
5. User clicks "Update Patch"
6. Backend deletes all old relationships
7. Backend creates new relationships
8. Patch detail page shows updated modules
```

### Viewing Module Usage
```
1. User opens module detail page
2. API fetches module with patchModules.patch
3. "Used in Patches" section displays if any exist
4. Shows count and patch cards
5. User can click to view any patch
```

## 🧪 Testing Scenarios

### Scenario 1: Create Patch with Modules
1. Go to "New Patch"
2. Fill in title and description
3. Click in "Modules Used" search box
4. Select 2-3 modules
5. Verify chips appear
6. Click "Create Patch"
7. ✅ Patch detail should show selected modules

### Scenario 2: Edit Patch Modules
1. Open existing patch
2. Click "Edit"
3. See current modules pre-selected
4. Remove one module
5. Add a different module
6. Click "Update Patch"
7. ✅ Patch detail should show updated modules

### Scenario 3: View Module Usage
1. Open a module that's used in patches
2. Scroll to "Used in Patches" section
3. ✅ Should see patch cards
4. ✅ Count should match number of cards
5. Click a patch card
6. ✅ Should navigate to patch detail

### Scenario 4: Delete Module
1. Create a patch using a module
2. Delete that module
3. View the patch
4. ✅ Module should no longer appear (CASCADE DELETE)

### Scenario 5: Empty States
1. Try creating patch with no modules
2. ✅ Should work (modules are optional)
3. View module with no patches
4. ✅ "Used in Patches" section should not appear

## 🚀 Benefits

### For Users
- **Organization**: See which modules are in each patch
- **Discovery**: Find patches that use specific modules
- **Documentation**: Better patch documentation
- **Planning**: Identify frequently used modules

### Technical
- **Data integrity**: Foreign key constraints
- **Performance**: Indexed queries
- **Maintainability**: Clear relationships
- **Scalability**: Handles large collections

## 📊 Database Queries

### Get Patch with Modules
```prisma
prisma.patch.findUnique({
  where: { id },
  include: {
    patchModules: {
      include: { module: true }
    }
  }
})
```

### Get Module with Patches
```prisma
prisma.module.findUnique({
  where: { id },
  include: {
    patchModules: {
      include: {
        patch: {
          select: {
            id: true,
            title: true,
            description: true,
            tags: true,
            images: true,
          }
        }
      }
    }
  }
})
```

### Count Patches Using Module
```prisma
prisma.patchModule.count({
  where: { moduleId }
})
```

## 🎯 Future Enhancements

### Potential Features
- [ ] Filter patches by module
- [ ] Show module statistics (most used, etc.)
- [ ] Quick add module from patch detail view
- [ ] Bulk operations (add module to multiple patches)
- [ ] Module suggestions based on patch type
- [ ] Visual module rack diagram
- [ ] Export module list from patch

### Advanced Features
- [ ] Module position/order in patch
- [ ] CV/Audio routing between modules
- [ ] Module settings per patch
- [ ] Shared patches with module lists
- [ ] Module wishlist based on patches

## 🐛 Troubleshooting

### TypeScript Errors After Schema Change
**Problem**: TypeScript shows errors about `patchModules` not existing

**Solution**: Restart the dev server
```bash
# Stop server (Ctrl+C or kill process)
npm run dev
```

### Modules Not Appearing in Selector
**Problem**: Dropdown is empty

**Solution**:
1. Check if user has modules in their collection
2. Go to "My Modules" and add some modules
3. Return to patch form

### Relationships Not Saving
**Problem**: Selected modules don't appear after saving

**Solution**:
1. Check browser console for API errors
2. Verify `moduleIds` array is being sent
3. Check server logs for database errors

### Module Detail Not Showing Patches
**Problem**: "Used in Patches" section doesn't appear

**Solution**:
1. Verify module is actually used in patches
2. Check API response includes `patchModules`
3. Ensure API route includes proper `include` statement

## 📝 Summary

**Files Modified**: 8
- ✅ `prisma/schema.prisma` - Added PatchModule model
- ✅ `app/api/patches/route.ts` - Handle module IDs in POST
- ✅ `app/api/patches/[id]/route.ts` - Include modules in GET, handle in PUT
- ✅ `app/api/modules/[id]/route.ts` - Include patches in GET
- ✅ `components/ModuleSelector.tsx` - NEW component
- ✅ `components/PatchForm.tsx` - Integrated ModuleSelector
- ✅ `app/patches/[id]/page.tsx` - Display modules used
- ✅ `app/modules/[id]/page.tsx` - Display patches using module

**Database Changes**: 1 table
- ✅ `patches_patch_modules` junction table created

**New Features**: 6
1. ✅ Select modules when creating patch
2. ✅ Select modules when editing patch
3. ✅ Display modules in patch detail
4. ✅ Display patches in module detail
5. ✅ Search/filter modules
6. ✅ Bidirectional navigation

**User Experience**:
- Intuitive module selection
- Visual feedback with chips
- Responsive design
- Click-through navigation
- Empty states handled
- Loading states

---

**Implementation Date**: Sunday, October 5, 2025  
**Status**: ✅ Complete and Ready to Test  
**Next Step**: Restart dev server and test!

🎛️ **Ready to link your modules to patches!** 🎵

