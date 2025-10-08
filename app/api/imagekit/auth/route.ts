import { NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";

export async function GET() {
  try {
    // Set expiration to 10 minutes from now (in seconds)
    // ImageKit requires expire to be less than 1 hour in the future
    // Using 10 minutes to be extra conservative with time synchronization
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expire = currentTimestamp + (10 * 60); // Current time + 10 minutes (600 seconds)
    
    // Generate a unique token for each request to avoid collisions
    // Using crypto.randomUUID() for V4 UUIDs as suggested by ImageKit
    const uniqueToken = crypto.randomUUID();
    
    const authenticationParameters = imagekit.getAuthenticationParameters(
      uniqueToken, // unique token for each request
      expire       // expire time in seconds
    );
    
    console.log(`🔐 Generated new ImageKit auth token: ${uniqueToken.substring(0, 8)}...`);
    
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return NextResponse.json(
      { error: "Failed to get authentication parameters" },
      { status: 500 }
    );
  }
}

