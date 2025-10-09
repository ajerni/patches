'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Image as KonvaImage, Transformer } from 'react-konva';
import Konva from 'konva';
import { 
  PATCH_SCHEMA_SYMBOLS, 
  CABLE_COLORS, 
  CableType, 
  getSymbolsByCategory,
  SymbolDefinition 
} from '@/lib/patchSchemaSymbols';
import { 
  preloadPatchSchemaImages, 
  getCachedImages, 
  areImagesLoaded, 
  getLoadProgress 
} from '@/lib/patchSchemaImageCache';

export interface SchemaData {
  symbols: SchemaSymbol[];
  cables: SchemaCable[];
  version: string;
}

export interface SchemaSymbol {
  id: string;
  symbolId: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface SchemaCable {
  id: string;
  points: number[]; // [x1, y1, x2, y2, ...]
  color: string;
  type: CableType;
  strokeWidth: number;
}

interface PatchSchemaEditorProps {
  initialSchema?: SchemaData | null;
  onSave: (schema: SchemaData) => void;
  onClose: () => void;
}

export default function PatchSchemaEditor({ initialSchema, onSave, onClose }: PatchSchemaEditorProps) {
  const [tool, setTool] = useState<'select' | 'cable'>('select');
  const [cableType, setCableType] = useState<CableType>('audio');
  const [symbols, setSymbols] = useState<SchemaSymbol[]>(initialSchema?.symbols || []);
  const [cables, setCables] = useState<SchemaCable[]>(initialSchema?.cables || []);
  const [selectedSymbolCategory, setSelectedSymbolCategory] = useState<SymbolDefinition['category']>('audio-sources');
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [imagesLoading, setImagesLoading] = useState(!areImagesLoaded());
  const [loadProgress, setLoadProgress] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawingCable, setDrawingCable] = useState<number[] | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const BASE_CANVAS_WIDTH = 1200;
  const BASE_CANVAS_HEIGHT = 800;
  
  // Canvas dimensions remain at base size
  const CANVAS_WIDTH = BASE_CANVAS_WIDTH;
  const CANVAS_HEIGHT = BASE_CANVAS_HEIGHT;
  
  // Calculate scale to fit available space (both mobile and desktop)
  const getFitScale = () => {
    if (!containerWidth || !containerHeight) return 1;
    const padding = isMobile ? 20 : 40; // More padding on desktop for nice margins
    const scaleX = (containerWidth - padding) / BASE_CANVAS_WIDTH;
    const scaleY = (containerHeight - padding) / BASE_CANVAS_HEIGHT;
    return Math.min(scaleX, scaleY, 1); // Never scale up beyond 100%
  };
  
  const fitScale = getFitScale();
  const displayScale = isMobile ? fitScale * zoomLevel : fitScale;

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Sidebar is visible by default on both mobile and desktop
      // Users can toggle it manually if needed
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Measure canvas container size (both mobile and desktop)
  useEffect(() => {
    const updateContainerSize = () => {
      if (canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width);
        setContainerHeight(rect.height);
      }
    };

    // Immediate measurement
    if (canvasContainerRef.current) {
      updateContainerSize();
    }

    // Also measure after a short delay to ensure layout is complete
    const timeoutId = setTimeout(updateContainerSize, 100);

    window.addEventListener('resize', updateContainerSize);
    
    // Use ResizeObserver for more accurate container size tracking
    let resizeObserver: ResizeObserver | null = null;
    if (canvasContainerRef.current) {
      resizeObserver = new ResizeObserver(updateContainerSize);
      resizeObserver.observe(canvasContainerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateContainerSize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [showSidebar]); // Re-measure when sidebar visibility changes

  // Reset zoom and re-measure when toggling sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setZoomLevel(1);
      // Force re-measurement after sidebar animation completes
      setTimeout(() => {
        if (canvasContainerRef.current) {
          const rect = canvasContainerRef.current.getBoundingClientRect();
          setContainerWidth(rect.width);
          setContainerHeight(rect.height);
        }
      }, 50);
    }
  }, [showSidebar, isMobile]);

  // Load SVG images from cache or preload them
  useEffect(() => {
    const loadImages = async () => {
      // Check if already loaded in cache
      const cached = getCachedImages();
      if (cached) {
        setLoadedImages(cached);
        setImagesLoading(false);
        return;
      }

      // Start preloading
      setImagesLoading(true);
      
      // Update progress periodically
      const progressInterval = setInterval(() => {
        setLoadProgress(getLoadProgress());
      }, 100);

      try {
        const imageMap = await preloadPatchSchemaImages();
        setLoadedImages(imageMap);
        setLoadProgress(100);
      } catch (error) {
        console.error('Failed to load images:', error);
      } finally {
        clearInterval(progressInterval);
        setImagesLoading(false);
      }
    };

    loadImages();
  }, []);

  // Handle selecting shapes
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    
    if (clickedOnEmpty) {
      setSelectedId(null);
      return;
    }

    const clickedId = e.target.id();
    if (clickedId && (clickedId.startsWith('symbol-') || clickedId.startsWith('cable-'))) {
      setSelectedId(clickedId);
    }
  };

  // Handle touch events for selection (separate from cable drawing)
  const handleStageTouchStart = (e: Konva.KonvaEventObject<TouchEvent>) => {
    // Only handle selection if not in cable drawing mode
    if (tool === 'select') {
      // Don't prevent default for selection touches
      handleStageClick(e as any);
    }
  };

  // Handle dragging symbols
  const handleSymbolDragEnd = (id: string, x: number, y: number) => {
    // Clamp position to keep symbols within canvas bounds
    const margin = 50; // Keep at least this much of the symbol visible
    const clampedX = Math.max(margin, Math.min(x, CANVAS_WIDTH - margin));
    const clampedY = Math.max(margin, Math.min(y, CANVAS_HEIGHT - margin));
    
    setSymbols(prev => prev.map(sym => 
      sym.id === id ? { ...sym, x: clampedX, y: clampedY } : sym
    ));
  };

  // Add symbol to canvas
  const handleAddSymbol = (symbolId: string) => {
    const newSymbol: SchemaSymbol = {
      id: `symbol-${Date.now()}-${Math.random()}`,
      symbolId,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      rotation: 0,
      scale: 0.5,
    };
    setSymbols(prev => [...prev, newSymbol]);
  };

  // Handle canvas mouse events for cable drawing
  const handleCanvasMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (tool !== 'cable') return;
    
    // Only prevent default touch behavior when actually drawing cables
    if (e.evt.type === 'touchstart') {
      e.evt.preventDefault();
    }
    
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Adjust for scale - divide by displayScale to get actual canvas coordinates
    const x = pos.x / displayScale;
    const y = pos.y / displayScale;
    
    setDrawingCable([x, y]);
  };

  const handleCanvasMouseMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (tool !== 'cable' || !drawingCable) return;
    
    // Prevent default touch behavior to avoid conflicts
    if (e.evt.type === 'touchmove') {
      e.evt.preventDefault();
    }
    
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Adjust for scale - divide by displayScale to get actual canvas coordinates
    const x = pos.x / displayScale;
    const y = pos.y / displayScale;

    setDrawingCable([drawingCable[0], drawingCable[1], x, y]);
  };

  const handleCanvasMouseUp = (e?: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Prevent default touch behavior to avoid conflicts
    if (e && e.evt.type === 'touchend') {
      e.evt.preventDefault();
    }
    
    if (tool !== 'cable' || !drawingCable || drawingCable.length < 4) {
      setDrawingCable(null);
      return;
    }

    const newCable: SchemaCable = {
      id: `cable-${Date.now()}-${Math.random()}`,
      points: drawingCable,
      color: CABLE_COLORS[cableType],
      type: cableType,
      strokeWidth: 3,
    };

    setCables(prev => [...prev, newCable]);
    setDrawingCable(null);
  };

  // Delete selected item
  const handleDelete = () => {
    if (!selectedId) return;

    if (selectedId.startsWith('symbol-')) {
      setSymbols(prev => prev.filter(sym => sym.id !== selectedId));
    } else if (selectedId.startsWith('cable-')) {
      setCables(prev => prev.filter(cable => cable.id !== selectedId));
    }
    
    setSelectedId(null);
  };

  // Clear canvas
  const handleClear = () => {
    if (confirm('Clear entire schema? This cannot be undone.')) {
      setSymbols([]);
      setCables([]);
      setSelectedId(null);
    }
  };

  // Save schema
  const handleSave = () => {
    const schema: SchemaData = {
      symbols,
      cables,
      version: '1.0',
    };
    onSave(schema);
  };

  // Export as image
  const handleExportImage = () => {
    const stage = stageRef.current;
    if (!stage) return;

    // Temporarily reset position and scale for export
    const originalX = stage.x();
    const originalY = stage.y();
    const originalScaleX = stage.scaleX();
    const originalScaleY = stage.scaleY();
    
    stage.position({ x: 0, y: 0 });
    stage.scale({ x: 1, y: 1 });

    const dataURL = stage.toDataURL({ pixelRatio: 2 });
    
    // Restore original position and scale
    stage.position({ x: originalX, y: originalY });
    stage.scale({ x: originalScaleX, y: originalScaleY });

    const link = document.createElement('a');
    link.download = 'patch-schema.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories: SymbolDefinition['category'][] = ['audio-sources', 'audio-modifiers', 'cv-sources', 'cv-modifiers'];

  // Show loading screen while images are loading
  if (imagesLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Loading Patch Schema Symbols
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Loading {loadProgress}% ({Math.round((loadProgress / 100) * PATCH_SCHEMA_SYMBOLS.length)} / {PATCH_SCHEMA_SYMBOLS.length})
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            ></div>
          </div>
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-2xl flex flex-col max-h-[98vh] sm:max-h-[95vh] w-full max-w-[1600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-2 sm:p-4 border-b">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-2xl font-bold text-gray-900">
              {isMobile ? 'Schema Editor' : 'Patch Schema Editor'}
            </h2>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {!isMobile && (
              <button
                type="button"
                onClick={handleExportImage}
                className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Export
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Symbol Palette */}
          {showSidebar && (
          <div className={`${isMobile ? 'w-32' : 'w-64'} border-r bg-gray-50 overflow-y-auto ${isMobile ? 'p-1' : 'p-4'}`}>
            <h3 className={`font-bold ${isMobile ? 'mb-1 text-[10px]' : 'mb-3 text-base'} text-gray-900`}>
              {isMobile ? 'Symbols' : 'Symbol Library'}
            </h3>
            
            {/* Category Tabs */}
            <div className={`flex flex-col ${isMobile ? 'gap-0.5 mb-1' : 'gap-1 mb-4'}`}>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSymbolCategory(cat);
                  }}
                  className={`${isMobile ? 'px-1 py-0.5 text-[8px]' : 'px-3 py-2 text-xs'} rounded text-left ${
                    selectedSymbolCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {cat.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              ))}
            </div>

            {/* Symbols Grid */}
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} ${isMobile ? 'gap-0.5' : 'gap-2'}`}>
              {getSymbolsByCategory(selectedSymbolCategory).map(symbol => (
                <button
                  key={symbol.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddSymbol(symbol.id);
                  }}
                  className={`${isMobile ? 'p-0.5' : 'p-2'} bg-white border rounded hover:bg-blue-50 hover:border-blue-500 transition-colors`}
                  title={symbol.name}
                >
                  {loadedImages.has(symbol.id) ? (
                    <img
                      src={symbol.svgPath}
                      alt={symbol.name}
                      className={`w-full ${isMobile ? 'h-8' : 'h-16'} object-contain`}
                    />
                  ) : (
                    <div className={`w-full ${isMobile ? 'h-8' : 'h-16'} bg-gray-200 animate-pulse`} />
                  )}
                  {!isMobile && (
                    <div className="text-[10px] text-center mt-1 text-gray-700 truncate">
                      {symbol.name}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className={`flex flex-col lg:flex-row items-start lg:items-center gap-2 ${isMobile ? 'p-1' : 'p-3'} border-b bg-gray-50`}>
              {/* Tool Selection */}
              <div className="flex items-center gap-1 sm:gap-2">
                {!isMobile && <span className="text-xs sm:text-sm font-medium text-gray-700">Tool:</span>}
                <button
                  type="button"
                  onClick={() => setTool('select')}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded whitespace-nowrap ${
                    tool === 'select'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Select
                </button>
                <button
                  type="button"
                  onClick={() => setTool('cable')}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded whitespace-nowrap ${
                    tool === 'cable'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {isMobile ? 'Cable' : 'Draw Cable'}
                </button>
              </div>

              {/* Cable Color Selection */}
              {tool === 'cable' && (
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  {!isMobile && <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Cable Type:</span>}
                  {Object.entries(CABLE_COLORS).map(([type, color]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCableType(type as CableType)}
                      className={`px-2 sm:px-3 md:px-4 py-1 text-xs sm:text-sm font-medium rounded border-2 transition-all whitespace-nowrap ${
                        cableType === type ? 'border-black shadow-md' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color, color: type === 'audio' ? '#000' : '#fff' }}
                      title={type}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 sm:gap-2 lg:ml-auto">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!selectedId}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Delete
                </button>
                {!isMobile && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 whitespace-nowrap"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Canvas */}
            <div 
              ref={canvasContainerRef}
              className={`flex-1 bg-gray-100 ${isMobile ? 'p-1 overflow-auto' : 'p-4 overflow-hidden'} relative flex items-center justify-center`}
              style={isMobile ? { WebkitOverflowScrolling: 'touch' } : undefined}
            >
              {/* Mobile Zoom Controls */}
              {isMobile && containerWidth > 0 && (
                <div className="absolute top-1 right-1 z-10 flex flex-col gap-0.5 bg-white/95 backdrop-blur-sm rounded shadow-lg p-0.5 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}
                    className="w-7 h-7 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={zoomLevel >= 3}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 1))}
                    className="w-7 h-7 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={zoomLevel <= 1}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className="w-7 h-7 flex items-center justify-center bg-gray-600 text-white rounded hover:bg-gray-700 text-[8px] font-semibold"
                  >
                    FIT
                  </button>
                </div>
              )}
              
              {containerWidth > 0 && (
              <div 
                className="bg-white border-2 border-gray-300" 
                style={{ 
                  width: BASE_CANVAS_WIDTH * displayScale, 
                  height: BASE_CANVAS_HEIGHT * displayScale,
                  flexShrink: 0
                }}
              >
                <Stage
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  scaleX={displayScale}
                  scaleY={displayScale}
                  draggable={false}
                  ref={stageRef}
                  onClick={handleStageClick}
                  onTap={handleStageClick}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onTouchStart={tool === 'cable' ? handleCanvasMouseDown : handleStageTouchStart}
                  onTouchMove={handleCanvasMouseMove}
                  onTouchEnd={handleCanvasMouseUp}
                >
                  <Layer ref={layerRef}>
                    {/* Grid background */}
                    {Array.from({ length: Math.floor(CANVAS_HEIGHT / 50) }).map((_, i) => (
                      <Line
                        key={`h-${i}`}
                        points={[0, i * 50, CANVAS_WIDTH, i * 50]}
                        stroke="#e0e0e0"
                        strokeWidth={1}
                      />
                    ))}
                    {Array.from({ length: Math.floor(CANVAS_WIDTH / 50) }).map((_, i) => (
                      <Line
                        key={`v-${i}`}
                        points={[i * 50, 0, i * 50, CANVAS_HEIGHT]}
                        stroke="#e0e0e0"
                        strokeWidth={1}
                      />
                    ))}

                    {/* Cables */}
                    {cables.map(cable => (
                      <Line
                        key={cable.id}
                        id={cable.id}
                        points={cable.points}
                        stroke={cable.color}
                        strokeWidth={cable.strokeWidth}
                        lineCap="round"
                        lineJoin="round"
                        onClick={() => setSelectedId(cable.id)}
                        onTap={() => setSelectedId(cable.id)}
                        opacity={selectedId === cable.id ? 0.7 : 1}
                      />
                    ))}

                    {/* Currently drawing cable */}
                    {drawingCable && (
                      <Line
                        points={drawingCable}
                        stroke={CABLE_COLORS[cableType]}
                        strokeWidth={3}
                        lineCap="round"
                        lineJoin="round"
                        dash={[5, 5]}
                      />
                    )}

                    {/* Symbols */}
                    {symbols.map(symbol => {
                      const img = loadedImages.get(symbol.symbolId);
                      if (!img) return null;

                      return (
                        <KonvaImage
                          key={symbol.id}
                          id={symbol.id}
                          image={img}
                          x={symbol.x}
                          y={symbol.y}
                          offsetX={img.width / 2}
                          offsetY={img.height / 2}
                          scaleX={symbol.scale}
                          scaleY={symbol.scale}
                          rotation={symbol.rotation}
                          draggable={tool === 'select'}
                          dragBoundFunc={(pos) => {
                            // Keep symbols within canvas bounds during drag
                            const margin = 50;
                            return {
                              x: Math.max(margin, Math.min(pos.x, CANVAS_WIDTH - margin)),
                              y: Math.max(margin, Math.min(pos.y, CANVAS_HEIGHT - margin))
                            };
                          }}
                          onClick={() => setSelectedId(symbol.id)}
                          onTap={() => setSelectedId(symbol.id)}
                          onDragEnd={(e) => handleSymbolDragEnd(symbol.id, e.target.x(), e.target.y())}
                          shadowColor={selectedId === symbol.id ? 'blue' : 'transparent'}
                          shadowBlur={selectedId === symbol.id ? 10 : 0}
                        />
                      );
                    })}
                  </Layer>
                </Stage>
              </div>
              )}
            </div>

            {/* Instructions */}
            <div className="p-3 bg-blue-50 border-t text-sm text-gray-700">
              <strong>Instructions:</strong> 
              {tool === 'select' ? (
                <span> Click symbol to add. Drag symbols to move. Click on symbols or cables to select and delete them.</span>
              ) : (
                <span> Click and drag on the canvas to draw cables. Choose cable type using the colored buttons above.</span>
              )}
              <br />
              <span>
              <strong>Credits:</strong>  Patch Symbols from PATCH &amp; TWEAK by Kim Bjørn and Chris Meyer, published by Bjooks, are licensed under{" "}
                <a
                  href="https://creativecommons.org/licenses/by-nd/4.0/deed.en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-700 hover:text-blue-900"
                >
                  CC BY-ND 4.0
                </a>
              </span>
              {isMobile && (
                <>
                  <br />
                  <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-xs">
                    <strong>Note:</strong> Editor works best on Desktop screen
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

