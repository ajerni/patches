# Patch Schema Editor Feature

## Overview
A visual patch schema editor has been added to the Eurorack Patches application. Users can now create, edit, and view visual diagrams of their patches using modular synth symbols and colored connection cables.

## Features Implemented

### 1. **Visual Schema Editor (Modal)**
- **Canvas-based editor** with 1200x800px workspace
- **100+ SVG symbols** organized in 4 categories:
  - Audio Sources (18 symbols) - VCOs, noise, sample players, etc.
  - Audio Modifiers (27 symbols) - VCAs, VCFs, mixers, effects, etc.
  - CV Sources (31 symbols) - LFOs, envelopes, sequencers, etc.
  - CV Modifiers (29 symbols) - Logic gates, clock dividers, utilities, etc.

### 2. **Drawing Tools**
- **Select Tool**: Move and position symbols on canvas
- **Cable Tool**: Draw connection lines between modules
- **5 Cable Colors** representing different signal types:
  - 🟡 **Yellow** - Audio signals
  - ⚫ **Gray** - 1V/octave pitch CV
  - 🔵 **Blue** - Other CV signals
  - 🔴 **Red** - Gates and triggers
  - 🟢 **Green** - Master clocks

### 3. **Editor Features**
- ✅ Drag and drop symbols from palette
- ✅ Move symbols around canvas
- ✅ Draw cables between modules
- ✅ Delete symbols or cables
- ✅ Clear entire canvas
- ✅ Export schema as PNG image
- ✅ Save schema with patch
- ✅ Grid background for alignment

### 4. **Schema Viewer**
- Read-only display of saved schemas
- Shows on patch detail page
- Color legend for cable types
- Responsive design

## Technical Implementation

### Database Changes
```sql
ALTER TABLE patches_patches ADD COLUMN schema JSONB;
```

### Files Created/Modified

#### New Files:
1. **`lib/patchSchemaSymbols.ts`** - Symbol registry and definitions
2. **`components/PatchSchemaEditor.tsx`** - Modal editor component (react-konva)
3. **`components/PatchSchemaViewer.tsx`** - Read-only viewer component
4. **`add-schema-field.sql`** - Database migration SQL
5. **`public/patch_schemas/`** - All SVG symbol files (copied from source)

#### Modified Files:
1. **`prisma/schema.prisma`** - Added `schema Json?` field to Patch model
2. **`components/PatchForm.tsx`** - Integrated schema editor button and modal
3. **`app/api/patches/route.ts`** - Added schema field to validation
4. **`app/api/patches/[id]/route.ts`** - Added schema field to validation
5. **`app/patches/[id]/page.tsx`** - Added schema viewer section

### NPM Packages Added
```bash
npm install konva react-konva
```

## Data Structure

### Schema JSON Format
```json
{
  "version": "1.0",
  "symbols": [
    {
      "id": "symbol-1234567890-0.123",
      "symbolId": "vco-sine",
      "x": 600,
      "y": 400,
      "rotation": 0,
      "scale": 0.5
    }
  ],
  "cables": [
    {
      "id": "cable-1234567890-0.456",
      "points": [100, 200, 300, 400],
      "color": "#FFD700",
      "type": "audio",
      "strokeWidth": 3
    }
  ]
}
```

## Usage

### Creating a Schema

1. **Navigate to patch form** (create or edit patch)
2. **Scroll to "Patch Schema" section**
3. **Click "Create Schema" button** - Opens modal editor
4. **Add symbols**:
   - Select category from sidebar (Audio Sources, Audio Modifiers, CV Sources, CV Modifiers)
   - Click on a symbol to add it to canvas center
   - Drag symbols to desired positions
5. **Draw cables**:
   - Click "Draw Cable" tool
   - Select cable type (color)
   - Click and drag on canvas to draw connections
6. **Edit/Delete**:
   - Use "Select" tool to click on symbols or cables
   - Click "Delete" button to remove selected item
7. **Save**:
   - Click "Save Schema" to save and close
   - Or "Export PNG" to download as image
   - Or "Close" to cancel changes

### Viewing a Schema

Schemas are automatically displayed on the patch detail page if they exist, in a dedicated "Patch Schema" section with:
- Color legend explaining cable types
- Full canvas view of the diagram
- Scrollable container for large schemas

## Symbol Categories

### Audio Sources (Circle Shape)
- VCO (Sine, Square, Triangle, Sawtooth, PWM, Ramp, Wavetable)
- Noise Generator
- Sample Player/Recorder
- Microphone Input
- Physical Modeling (Generic, String, Membrane, Pipe)
- Speech Synthesis
- Granular Synth

### Audio Modifiers (Triangle Shape)
- VCA, VCF (Lowpass, Highpass, Bandpass, Notch, Comb)
- Mixer (Regular, Inverting)
- Attenuator, Crossfader
- Effects (Reverb, Delay, Chorus, Phase Shifter)
- Waveshaper, Wavefolder, Clipper
- Ring Modulator, LPG
- Rectifiers, Inverter
- Resonator, Switch

### CV Sources (Square Shape)
- LFO (Sine, Square, Triangle, Sawtooth, BPM-synced)
- Envelopes (AD, AR, ADSR, AHDSR, DADSR, with/without loop)
- Envelope Follower
- Sequencer (CV/Gate)
- Random (Smooth, Stepped)
- Master Clock
- Keyboard/Touch Control
- Voltage Slider
- Bias Voltage
- Trigger Pattern Generator

### CV Modifiers (Diamond Shape)
- Logic Gates (AND, OR, NOT, NAND, NOR, XOR, XNOR)
- Clock Divider/Multiplier
- Comparator, Quantizer
- Sample & Hold, Slew Limiter
- CV Mixer, Attenuator, Attenuverter, Inverter
- Buffered Multiple
- Precision Adder
- Gate Delay
- VCA (DC-coupled)
- Rectifiers (Full/Half)
- CV Matrix Mixer
- CV Switch

## Cable Types and Colors

| Type | Color | Hex Code | Use Case |
|------|-------|----------|----------|
| **Audio** | Yellow | #FFD700 | Audio signals between modules |
| **Pitch** | Gray | #808080 | 1V/octave pitch control voltage |
| **CV** | Blue | #4169E1 | All other CV signals (modulation, etc.) |
| **Gate** | Red | #DC143C | Triggers and gates |
| **Clock** | Green | #32CD32 | Master clock signals |

## Benefits

1. **Visual Documentation**: Easier to remember and recreate patches
2. **Learning Tool**: Understand signal flow at a glance
3. **Sharing**: Export schemas as images to share on social media
4. **Planning**: Design patches before patching cables
5. **Standardization**: Consistent symbols across the community

## Tips for Best Schemas

- **Start with sources** on the left side
- **End with outputs** on the right side
- **Flow left-to-right** for easy reading
- **Use correct cable colors** for clarity
- **Group related modules** vertically
- **Space symbols** using the 50px grid
- **Export as PNG** for sharing outside the app

## Future Enhancements (Potential)

- Auto-layout algorithms
- Snap-to-grid functionality
- Copy/paste symbols
- Zoom in/out
- Symbol rotation controls
- Cable routing with waypoints
- Module grouping/boxes
- Text annotations
- Template library
- Community schemas

## Troubleshooting

### Schema not showing
- Ensure you clicked "Save Schema" in the editor
- Check that the patch was saved after adding schema
- Verify browser console for errors

### Symbols not loading
- SVG files must be in `public/patch_schemas/` directory
- Check browser network tab for 404 errors
- Ensure SVG files are valid and not corrupted

### Editor performance issues
- Clear browser cache
- Reduce number of symbols on canvas
- Use Chrome/Edge for best performance (Chromium-based)

## Technology Stack

- **React Konva** - Canvas rendering
- **Konva** - HTML5 Canvas library
- **Next.js Dynamic Import** - Avoid SSR issues
- **PostgreSQL JSONB** - Schema storage
- **Prisma** - Database ORM
- **SVG** - Vector graphics for symbols

---

**Version**: 1.0  
**Date**: October 2025  
**Status**: ✅ Production Ready

