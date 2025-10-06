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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawingCable, setDrawingCable] = useState<number[] | null>(null);
  
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;

  // Load SVG images
  useEffect(() => {
    const loadImages = async () => {
      const imageMap = new Map<string, HTMLImageElement>();
      
      for (const symbol of PATCH_SCHEMA_SYMBOLS) {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = symbol.svgPath;
        
        await new Promise<void>((resolve) => {
          img.onload = () => {
            imageMap.set(symbol.id, img);
            resolve();
          };
          img.onerror = () => {
            console.error(`Failed to load ${symbol.id}`);
            resolve();
          };
        });
      }
      
      setLoadedImages(imageMap);
    };

    loadImages();
  }, []);

  // Handle selecting shapes
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    
    if (clickedOnEmpty) {
      setSelectedId(null);
      return;
    }

    const clickedId = e.target.id();
    if (clickedId && clickedId.startsWith('symbol-')) {
      setSelectedId(clickedId);
    }
  };

  // Handle dragging symbols
  const handleSymbolDragEnd = (id: string, x: number, y: number) => {
    setSymbols(prev => prev.map(sym => 
      sym.id === id ? { ...sym, x, y } : sym
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
  const handleCanvasMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool !== 'cable') return;
    
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;

    setDrawingCable([pos.x, pos.y]);
  };

  const handleCanvasMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool !== 'cable' || !drawingCable) return;
    
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;

    setDrawingCable([drawingCable[0], drawingCable[1], pos.x, pos.y]);
  };

  const handleCanvasMouseUp = () => {
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

    const dataURL = stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = 'patch-schema.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories: SymbolDefinition['category'][] = ['audio-sources', 'audio-modifiers', 'cv-sources', 'cv-modifiers'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl flex flex-col max-h-[95vh] w-full max-w-[1600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Patch Schema Editor</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportImage}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Export PNG
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Schema
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Symbol Palette */}
          <div className="w-64 border-r bg-gray-50 overflow-y-auto p-4">
            <h3 className="font-bold mb-3 text-gray-900">Symbol Library</h3>
            
            {/* Category Tabs */}
            <div className="flex flex-col gap-1 mb-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSymbolCategory(cat);
                  }}
                  className={`px-3 py-2 text-xs rounded text-left ${
                    selectedSymbolCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {cat.replace('-', ' ').toUpperCase()}
                </button>
              ))}
            </div>

            {/* Symbols Grid */}
            <div className="grid grid-cols-2 gap-2">
              {getSymbolsByCategory(selectedSymbolCategory).map(symbol => (
                <button
                  key={symbol.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddSymbol(symbol.id);
                  }}
                  className="p-2 bg-white border rounded hover:bg-blue-50 hover:border-blue-500 transition-colors"
                  title={symbol.name}
                >
                  {loadedImages.has(symbol.id) ? (
                    <img
                      src={symbol.svgPath}
                      alt={symbol.name}
                      className="w-full h-16 object-contain"
                    />
                  ) : (
                    <div className="w-full h-16 bg-gray-200 animate-pulse" />
                  )}
                  <div className="text-[10px] text-center mt-1 text-gray-700 truncate">
                    {symbol.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b bg-gray-50">
              {/* Tool Selection */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Tool:</span>
                <button
                  type="button"
                  onClick={() => setTool('select')}
                  className={`px-3 py-1 text-sm rounded ${
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
                  className={`px-3 py-1 text-sm rounded ${
                    tool === 'cable'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Draw Cable
                </button>
              </div>

              {/* Cable Color Selection */}
              {tool === 'cable' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Cable Type:</span>
                  {Object.entries(CABLE_COLORS).map(([type, color]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCableType(type as CableType)}
                      className={`px-3 py-1 text-sm rounded border-2 ${
                        cableType === type ? 'border-black' : 'border-transparent'
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!selectedId}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              <div className="bg-white border-2 border-gray-300" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
                <Stage
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  ref={stageRef}
                  onClick={handleStageClick}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
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
                          onClick={() => setSelectedId(symbol.id)}
                          onDragEnd={(e) => handleSymbolDragEnd(symbol.id, e.target.x(), e.target.y())}
                          shadowColor={selectedId === symbol.id ? 'blue' : 'transparent'}
                          shadowBlur={selectedId === symbol.id ? 10 : 0}
                        />
                      );
                    })}
                  </Layer>
                </Stage>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-3 bg-blue-50 border-t text-sm text-gray-700">
              <strong>Instructions:</strong> 
              {tool === 'select' ? (
                <span> Click and drag symbols to move them. Click on symbols or cables to select them.</span>
              ) : (
                <span> Click and drag on the canvas to draw cables. Choose cable type using the colored buttons above.</span>
              )}
              <br />
              <span>
                Credits: Patch Symbols from PATCH &amp; TWEAK by Kim Bjørn and Chris Meyer, published by Bjooks, are licensed under{" "}
                <a
                  href="https://creativecommons.org/licenses/by-nd/4.0/deed.en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-700 hover:text-blue-900"
                >
                  CC BY-ND 4.0
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

