import { NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";

export async function GET() {
  try {
    // Set expiration to 5 minutes from now (in seconds)
    // ImageKit requires expire to be less than 1 hour in the future
    // Using 5 minutes to allow enough time for upload completion while staying well under 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expire = currentTimestamp + (5 * 60); // Current time + 5 minutes (300 seconds)
    
    // Generate a truly unique token for each request to avoid collisions
    // Using multiple sources of randomness to ensure uniqueness
    const timestamp = Date.now();
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    const randomHex = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    const uniqueToken = `${crypto.randomUUID()}-${timestamp}-${randomHex}`;
    
    const authenticationParameters = imagekit.getAuthenticationParameters(
      uniqueToken, // unique token for each request
      expire       // expire time in seconds
    );
    
    console.log(`🔐 Generated new ImageKit auth token: ${uniqueToken.substring(0, 8)}...`);
    console.log(`⏰ Expire timestamp: ${expire} (${new Date(expire * 1000).toISOString()})`);
    console.log(`⏰ Current timestamp: ${currentTimestamp} (${new Date(currentTimestamp * 1000).toISOString()})`);
    console.log(`⏰ Time until expire: ${expire - currentTimestamp} seconds`);
    console.log(`⏰ Token will be valid for: ${Math.floor((expire - currentTimestamp) / 60)} minutes and ${(expire - currentTimestamp) % 60} seconds`);
    
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

