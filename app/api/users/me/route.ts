import { NextResponse } from "next/server";
import { userOps, subscriptionOps } from "@/lib/db/supabase";

/**
 * GET /api/users/me?email=user@example.com
 * Get current user and subscription info
 * 
 * Query params:
 * - email: user email (required for now, later will use auth tokens)
 * 
 * Response:
 * {
 *   "success": true,
 *   "user": { "id", "email", "displayName", "isPremium" },
 *   "subscription": {
 *     "id", "planName", "status", "endsAt", "periods"
 *   } or null
 * }
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, error: "email query parameter required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await userOps.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "user not found" },
        { status: 404 }
      );
    }

    // Get active subscription
    const subscription = await subscriptionOps.getActiveByUser(user.id);

    console.log("✅ User lookup:", {
      email,
      isPremium: user.isPremium,
      hasSubscription: !!subscription,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          isPremium: user.isPremium,
          createdAt: user.createdAt,
        },
        subscription: subscription
          ? {
              id: subscription.id,
              planName: subscription.planName,
              status: subscription.status,
              createdAt: subscription.createdAt,
              updatedAt: subscription.updatedAt,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("User lookup error:", err);
    return NextResponse.json(
      { success: false, error },
      { status: 500 }
    );
  }
}
