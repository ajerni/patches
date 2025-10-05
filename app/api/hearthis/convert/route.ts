import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    console.log('=== HEARTHIS CONVERSION REQUEST ===');
    console.log('Received URL:', url);
    console.log('URL type:', typeof url);
    console.log('URL length:', url?.length);

    if (!url || typeof url !== "string") {
      console.log('ERROR: URL validation failed');
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Check if it's already an embed URL
    if (url.includes("app.hearthis.at/embed/")) {
      return NextResponse.json({ embedUrl: url });
    }

    // Check if it's a hearthis.at track URL
    if (!url.includes("hearthis.at/")) {
      return NextResponse.json(
        { error: "Not a valid hearthis.at URL" },
        { status: 400 }
      );
    }

    // Fetch the page to extract track ID
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EurorackPatchesBot/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch track page");
    }

    const html = await response.text();

    // Log first 1000 chars for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('HTML Preview:', html.substring(0, 1000));
    }

    // Extract track ID from various possible locations in the HTML
    
    // Method 1: Look for hearthis_at_track_ in id attributes (most reliable)
    const idMatch = html.match(/id="hearthis_at_track_(\d+)"/);
    console.log('idMatch:', idMatch?.[1]);
    
    // Method 2: Look for track ID in embed iframe src
    const embedMatch = html.match(/app\.hearthis\.at\/embed\/(\d{7,})/);
    console.log('embedMatch:', embedMatch?.[1]);
    
    // Method 3: Look for data-track-id attribute
    const dataMatch = html.match(/data-track-id="(\d{7,})"/);
    console.log('dataMatch:', dataMatch?.[1]);
    
    // Method 4: Look for track ID in JavaScript window variables
    const jsMatch = html.match(/window\.trackId\s*=\s*['"]*(\d{7,})['"]*/) || 
                   html.match(/track_id["\s:]+(\d{7,})/i);
    console.log('jsMatch:', jsMatch?.[1]);
    
    // Method 5: Look in JSON-LD structured data
    const jsonLdMatch = html.match(/"identifier":\s*"(\d{7,})"/);
    console.log('jsonLdMatch:', jsonLdMatch?.[1]);

    // Method 6: Look for any 8-digit numbers that might be track IDs
    const allMatches = html.match(/\d{8}/g);
    console.log('All 8-digit numbers found:', allMatches?.slice(0, 10));

    // Prefer track IDs that are at least 7 digits (avoid false positives)
    let trackId = idMatch?.[1] || embedMatch?.[1] || dataMatch?.[1] || jsMatch?.[1] || jsonLdMatch?.[1];

    // If no specific pattern matched, try to find the most common 8-digit number
    // (the track ID usually appears multiple times in the HTML)
    if (!trackId && allMatches && allMatches.length > 0) {
      const frequency: { [key: string]: number } = {};
      allMatches.forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
      });
      
      console.log('Number frequencies:', frequency);
      
      // Find the number that appears most frequently (and more than once)
      let maxCount = 0;
      let mostFrequent = null;
      for (const [num, count] of Object.entries(frequency)) {
        if (count > maxCount && count > 1) {
          maxCount = count;
          mostFrequent = num;
        }
      }
      
      if (mostFrequent) {
        console.log(`Using most frequent number: ${mostFrequent} (appears ${maxCount} times)`);
        trackId = mostFrequent;
      } else {
        // Fallback: use the middle number from the list (avoid edge numbers which might be timestamps)
        const middleIndex = Math.floor(allMatches.length / 2);
        trackId = allMatches[middleIndex];
        console.log(`Using middle number from list: ${trackId}`);
      }
    }

    if (!trackId) {
      console.error('Failed to extract track ID from:', url);
      console.error('HTML length:', html.length);
      
      return NextResponse.json(
        { 
          error: "Could not extract track ID from URL. Please use the embed URL directly.",
          debug: process.env.NODE_ENV === 'development' ? {
            htmlLength: html.length,
            foundNumbers: allMatches?.slice(0, 10)
          } : undefined
        },
        { status: 400 }
      );
    }

    // Generate the embed URL with the extracted track ID
    const embedUrl = `https://app.hearthis.at/embed/${trackId}/transparent_black/?hcolor=&color=&style=2&block_size=2&block_space=1&background=1&waveform=0&cover=0&autoplay=0&css=`;

    return NextResponse.json({ embedUrl, trackId });
  } catch (error) {
    console.error("Hearthis conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert URL. Please try using the embed URL directly." },
      { status: 500 }
    );
  }
}

