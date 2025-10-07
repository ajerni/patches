"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface HearthisEmbedProps {
  url: string;
  index?: number;
}

export function HearthisEmbed({ url, index = 0 }: HearthisEmbedProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Extract track ID from embed URL
  const extractTrackId = (url: string): string | null => {
    if (!url) return null;
    const embedMatch = url.match(/embed\/(\d{7,})/);
    return embedMatch?.[1] || null;
  };

  // Check if URL needs conversion
  const needsConversion = url.includes("hearthis.at/") && !url.includes("app.hearthis.at/embed/");

  useEffect(() => {
    async function convertUrl() {
      console.log('=== HearthisEmbed ===');
      console.log('Received URL:', url);
      console.log('Needs conversion:', needsConversion);
      
      if (!needsConversion) {
        // Already an embed URL
        console.log('Using URL directly (already embed format)');
        setEmbedUrl(url);
        return;
      }

      // Need to convert regular URL to embed URL
      console.log('Starting conversion...');
      setLoading(true);
      try {
        const response = await fetch("/api/hearthis/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        
        console.log('Conversion response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Conversion successful! Embed URL:', data.embedUrl);
          console.log('Track ID:', data.trackId);
          setEmbedUrl(data.embedUrl);
        } else {
          const errorData = await response.json();
          console.error("Failed to convert hearthis URL");
          console.error("Error response:", errorData);
          setError(true);
        }
      } catch (err) {
        console.error("Error converting hearthis URL:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    convertUrl();
  }, [url, needsConversion]);

  const trackId = embedUrl ? extractTrackId(embedUrl) : null;

  // Show loading state
  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg mb-3 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary-600 mr-2" />
        <span className="text-gray-600">Loading audio player...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg mb-3 border border-red-200">
        <p className="text-red-700 text-sm">
          Could not load audio player. The track URL might be invalid.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-600 hover:underline text-sm mt-1 inline-block"
        >
          Open on hearthis.at →
        </a>
      </div>
    );
  }

  // If we have an embed URL and track ID, show player
  if (embedUrl && trackId) {
    return (
      <div className="mb-4">
        {index > 0 && (
          <p className="text-sm text-gray-600 mb-2">Audio {index + 1}</p>
        )}
        <iframe
          scrolling="no"
          style={{ borderRadius: '10px' }}
          width="100%"
          height="150"
          src={embedUrl}
          frameBorder="0"
          allow="autoplay"
          allowTransparency
          title={`Audio ${index + 1}`}
        />
      </div>
    );
  }

  // If no track ID, show link
  return (
    <div className="p-4 bg-gray-50 rounded-lg mb-3">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-600 hover:underline flex items-center space-x-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
        <span>Listen here</span>
      </a>
      <p className="text-xs text-gray-500 mt-1 truncate">{url}</p>
    </div>
  );
}

