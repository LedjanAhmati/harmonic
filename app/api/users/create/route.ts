import { NextResponse } from "next/server";
import { userOps } from "@/lib/db/supabase";

/**
 * POST /api/users/create
 * Create or retrieve a user
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "displayName": "John Doe"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "user": { "id", "email", "displayName", "isPremium" },
 *   "isNewUser": true
 * }
 */
export async function POST(req: Request) {
  try {
    const { email, displayName } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "email is required" },
        { status: 400 }
      );
    }

    // Create or get existing user
    const user = await userOps.getOrCreateUser(
      email,
      displayName || email.split("@")[0]
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: "failed to create user" },
        { status: 500 }
      );
    }

    console.log("✅ User created/retrieved:", { email, userId: user.id });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          isPremium: user.isPremium,
        },
        isNewUser: true,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("User creation error:", err);
    return NextResponse.json(
      { success: false, error },
      { status: 500 }
    );
  }
}
