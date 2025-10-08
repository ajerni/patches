import { NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";

export async function GET() {
  try {
    // Set expiration to 30 seconds from now (in seconds)
    // ImageKit requires expire to be less than 1 hour in the future
    // Using 30 seconds to be extremely conservative and ensure immediate use
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expire = currentTimestamp + 30; // Current time + 30 seconds
    
    // Generate a unique token for each request to avoid collisions
    // Using crypto.randomUUID() for V4 UUIDs as suggested by ImageKit
    // Adding timestamp to make it even more unique
    const timestamp = Date.now();
    const uniqueToken = `${crypto.randomUUID()}-${timestamp}`;
    
    const authenticationParameters = imagekit.getAuthenticationParameters(
      uniqueToken, // unique token for each request
      expire       // expire time in seconds
    );
    
    console.log(`🔐 Generated new ImageKit auth token: ${uniqueToken.substring(0, 8)}...`);
    console.log(`⏰ Expire timestamp: ${expire} (${new Date(expire * 1000).toISOString()})`);
    console.log(`⏰ Current timestamp: ${currentTimestamp} (${new Date(currentTimestamp * 1000).toISOString()})`);
    console.log(`⏰ Time until expire: ${expire - currentTimestamp} seconds`);
    
    // Add cache-busting headers to prevent any caching
    const response = NextResponse.json(authenticationParameters);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return NextResponse.json(
      { error: "Failed to get authentication parameters" },
      { status: 500 }
    );
  }
}

