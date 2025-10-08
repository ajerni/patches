"use client";

import { useState, useRef, useCallback } from "react";
import { IKContext, IKUpload } from "imagekitio-react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  folder?: string;
}

export function ImageUpload({ images, onImagesChange, folder = "/patches" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [authCounter, setAuthCounter] = useState(0);
  const uploadRef = useRef<any>(null);

  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
  
  // Debug ImageKit configuration
  console.log("🔧 ImageKit config:", {
    publicKey: publicKey ? `${publicKey.substring(0, 8)}...` : 'MISSING',
    urlEndpoint: urlEndpoint || 'MISSING',
    folder: folder
  });
  
  // Authenticator function that fetches auth params from our API
  const authenticator = useCallback(async () => {
    try {
      console.log(`🔐 Fetching fresh ImageKit authentication (attempt #${authCounter + 1})...`);
      
      // Add multiple cache-busting parameters to ensure we always get a fresh token
      const cacheBuster = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const uniqueId = Math.random().toString(36).substring(2, 15);
      const response = await fetch(`/api/imagekit/auth?t=${cacheBuster}&r=${randomId}&_=${Date.now()}&attempt=${authCounter}&id=${uniqueId}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch authentication parameters");
      }
      const data = await response.json();
      const { signature, expire, token } = data;
      
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpire = expire - currentTime;
      
      console.log(`✅ Fresh ImageKit authentication successful (attempt #${authCounter + 1})`, { 
        expire: new Date(expire * 1000).toISOString(),
        tokenLength: token?.length || 0,
        cacheBuster: cacheBuster,
        randomId: randomId,
        uniqueId: uniqueId,
        timeUntilExpire: timeUntilExpire + " seconds",
        currentTime: new Date(currentTime * 1000).toISOString(),
        attempt: authCounter + 1
      });
      
      // Validate that the token is fresh (should have at least 2 minutes left for upload)
      if (timeUntilExpire < 120) {
        console.warn("⚠️ Token expires in less than 2 minutes, but proceeding with upload");
      }
      
      return { signature, expire, token };
    } catch (error) {
      console.error("❌ Authentication error:", error);
      throw new Error("Unable to authenticate upload");
    }
  }, [authCounter]);

  const onError = (err: any) => {
    console.error("❌ Upload error:", err);
    console.error("❌ Error details:", {
      message: err?.message,
      help: err?.help,
      statusCode: err?.$ResponseMetadata?.statusCode,
      fullError: err
    });
    setUploading(false);
    alert(`Failed to upload image: ${err?.message || 'Unknown error'}. Please try again.`);
  };

  const onSuccess = (res: any) => {
    console.log("✅ Upload success:", res);
    console.log("✅ New image URL:", res.url);
    setUploading(false);
    setUploadProgress(0);
    
    // Add the new image URL to the list
    const newImageUrl = res.url;
    onImagesChange([...images, newImageUrl]);
  };

  const onUploadProgress = (progress: any) => {
    setUploadProgress(progress.loaded / progress.total * 100);
  };

  const onUploadStart = () => {
    console.log("🚀 Upload starting - requesting fresh authentication...");
    setUploading(true);
    setUploadProgress(0);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const triggerUpload = () => {
    console.log("🚀 Triggering upload with fresh authentication...");
    // Force a new authenticator function by updating the counter
    setAuthCounter(prev => prev + 1);
    if (uploadRef.current) {
      uploadRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <IKContext
        publicKey={publicKey}
        urlEndpoint={urlEndpoint}
        authenticator={authenticator}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerUpload}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading... {Math.round(uploadProgress)}%</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Upload Image</span>
              </>
            )}
          </button>

          <IKUpload
            ref={uploadRef}
            fileName="image.jpg"
            folder={folder}
            useUniqueFileName={true}
            isPrivateFile={false}
            onError={onError}
            onSuccess={onSuccess}
            onUploadProgress={onUploadProgress}
            onUploadStart={onUploadStart}
            style={{ display: "none" }}
            validateFile={(file) => {
              // Validate file type and size
              const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
              if (!validTypes.includes(file.type)) {
                alert("Please upload a valid image file (JPG, PNG, or WebP)");
                return false;
              }
              if (file.size > 10 * 1024 * 1024) {
                alert("Image size must be less than 10MB");
                return false;
              }
              return true;
            }}
          />
        </div>

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </IKContext>

      {/* Image Preview Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, idx) => (
            <div key={idx} className="relative group">
              <img
                src={image}
                alt={`Patch image ${idx + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">No images uploaded yet</p>
         
        </div>
      )}
    </div>
  );
}

