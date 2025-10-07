'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Line, Image as KonvaImage } from 'react-konva';
import { SchemaData } from './PatchSchemaEditor';
import { PATCH_SCHEMA_SYMBOLS } from '@/lib/patchSchemaSymbols';

interface PatchSchemaViewerProps {
  schema: SchemaData;
  width?: number;
  height?: number;
}

export default function PatchSchemaViewer({ schema, width = 1200, height = 800 }: PatchSchemaViewerProps) {
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [loading, setLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(width);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle responsive sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Only scale down if container is smaller than the desired width
        if (containerWidth < width) {
          setContainerWidth(containerWidth);
        } else {
          setContainerWidth(width);
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [width]);

  useEffect(() => {
    const loadImages = async () => {
      const imageMap = new Map<string, HTMLImageElement>();
      
      // Get unique symbol IDs from the schema
      const symbolIds = new Set(schema.symbols.map(s => s.symbolId));
      
      for (const symbolId of symbolIds) {
        const symbolDef = PATCH_SCHEMA_SYMBOLS.find(s => s.id === symbolId);
        if (!symbolDef) continue;

        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = symbolDef.svgPath;
        
        await new Promise<void>((resolve) => {
          img.onload = () => {
            imageMap.set(symbolId, img);
            resolve();
          };
          img.onerror = () => {
            console.error(`Failed to load ${symbolId}`);
            resolve();
          };
        });
      }
      
      setLoadedImages(imageMap);
      setLoading(false);
    };

    loadImages();
  }, [schema]);

  // Calculate scale factor to maintain aspect ratio
  const scale = containerWidth / width;
  const scaledHeight = height * scale;

  if (loading) {
    return (
      <div 
        ref={containerRef}
        className="bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center w-full"
        style={{ height: scaledHeight, maxWidth: width }}
      >
        <div className="text-gray-500">Loading schema...</div>
      </div>
    );
  }

  if (!schema.symbols.length && !schema.cables.length) {
    return (
      <div 
        ref={containerRef}
        className="bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center w-full"
        style={{ height: scaledHeight, maxWidth: width }}
      >
        <div className="text-gray-500">No schema available</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-white border-2 border-gray-300 rounded overflow-hidden w-full" style={{ maxWidth: width }}>
      <Stage width={containerWidth} height={scaledHeight} scaleX={scale} scaleY={scale}>
        <Layer>
          {/* Grid background */}
          {Array.from({ length: Math.floor(height / 50) }).map((_, i) => (
            <Line
              key={`h-${i}`}
              points={[0, i * 50, width, i * 50]}
              stroke="#f0f0f0"
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: Math.floor(width / 50) }).map((_, i) => (
            <Line
              key={`v-${i}`}
              points={[i * 50, 0, i * 50, height]}
              stroke="#f0f0f0"
              strokeWidth={1}
            />
          ))}

          {/* Cables */}
          {schema.cables.map(cable => (
            <Line
              key={cable.id}
              points={cable.points}
              stroke={cable.color}
              strokeWidth={cable.strokeWidth}
              lineCap="round"
              lineJoin="round"
            />
          ))}

          {/* Symbols */}
          {schema.symbols.map(symbol => {
            const img = loadedImages.get(symbol.symbolId);
            if (!img) return null;

            return (
              <KonvaImage
                key={symbol.id}
                image={img}
                x={symbol.x}
                y={symbol.y}
                offsetX={img.width / 2}
                offsetY={img.height / 2}
                scaleX={symbol.scale}
                scaleY={symbol.scale}
                rotation={symbol.rotation}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}

