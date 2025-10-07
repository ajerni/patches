/**
 * Global image cache for patch schema SVGs
 * This loads all SVG symbols in parallel and caches them globally
 */

import { PATCH_SCHEMA_SYMBOLS } from './patchSchemaSymbols';

// Global cache
let imageCache: Map<string, HTMLImageElement> | null = null;
let loadingPromise: Promise<Map<string, HTMLImageElement>> | null = null;
let loadProgress = 0;
let totalImages = PATCH_SCHEMA_SYMBOLS.length;

/**
 * Get current loading progress (0-100)
 */
export function getLoadProgress(): number {
  return Math.round((loadProgress / totalImages) * 100);
}

/**
 * Check if images are already loaded
 */
export function areImagesLoaded(): boolean {
  return imageCache !== null && imageCache.size === totalImages;
}

/**
 * Get the cached images (returns null if not loaded yet)
 */
export function getCachedImages(): Map<string, HTMLImageElement> | null {
  return imageCache;
}

/**
 * Preload all patch schema SVG images in parallel
 * This can be called multiple times - it will return the same promise
 */
export function preloadPatchSchemaImages(): Promise<Map<string, HTMLImageElement>> {
  // If already loading, return the existing promise
  if (loadingPromise) {
    return loadingPromise;
  }

  // If already loaded, return immediately
  if (imageCache) {
    return Promise.resolve(imageCache);
  }

  // Start loading all images in parallel
  loadingPromise = new Promise<Map<string, HTMLImageElement>>((resolve) => {
    const imageMap = new Map<string, HTMLImageElement>();
    loadProgress = 0;

    // Create all image load promises
    const loadPromises = PATCH_SCHEMA_SYMBOLS.map((symbol) => {
      return new Promise<void>((resolveImage) => {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = symbol.svgPath;

        img.onload = () => {
          imageMap.set(symbol.id, img);
          loadProgress++;
          resolveImage();
        };

        img.onerror = () => {
          console.error(`Failed to load ${symbol.id} from ${symbol.svgPath}`);
          loadProgress++;
          resolveImage();
        };
      });
    });

    // Wait for all images to load in parallel
    Promise.all(loadPromises).then(() => {
      imageCache = imageMap;
      console.log(`✅ Loaded ${imageMap.size}/${totalImages} patch schema images`);
      resolve(imageMap);
    });
  });

  return loadingPromise;
}

/**
 * Clear the cache (useful for testing or memory management)
 */
export function clearImageCache(): void {
  imageCache = null;
  loadingPromise = null;
  loadProgress = 0;
}

