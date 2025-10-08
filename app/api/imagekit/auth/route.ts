import { NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";

export async function GET() {
  try {
    // Set expiration to 30 minutes from now (in seconds)
    // ImageKit requires expire to be less than 1 hour in the future
    // Using 30 minutes to avoid any edge cases with time synchronization
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expire = currentTimestamp + (30 * 60); // Current time + 30 minutes (1800 seconds)
    
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

