import { NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";

export async function GET() {
  try {
    // Set expiration to 1 hour from now (in seconds)
    // This ensures it's valid even with slight time differences between servers
    const expire = Math.floor(Date.now() / 1000) + 3600; // Current time + 1 hour
    
    const authenticationParameters = imagekit.getAuthenticationParameters(
      undefined, // token (optional)
      expire     // expire time in seconds
    );
    
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return NextResponse.json(
      { error: "Failed to get authentication parameters" },
      { status: 500 }
    );
  }
}

