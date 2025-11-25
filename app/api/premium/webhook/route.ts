import { NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  parseWebhookPayload,
  handleWebhookEvent,
  type WebhookPayload,
} from "@/lib/payments/lemonsqueezy";
import { userOps, subscriptionOps } from "@/lib/db/supabase";

/**
 * POST /api/premium/webhook
 * LemonSqueezy webhook handler for order & subscription events
 *
 * Set this URL in LemonSqueezy dashboard:
 * https://your-app.com/api/premium/webhook
 */
export async function POST(req: Request) {
  try {
    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("X-Signature") || "";

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.warn("Invalid LemonSqueezy webhook signature");
      return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
    }

    // Parse payload
    const payload = parseWebhookPayload(body);
    if (!payload) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    console.log(`LemonSqueezy webhook: ${payload.meta.event_name}`, {
      email: payload.data.attributes.customer_email,
      orderId: payload.data.attributes.order_number,
    });

    // Handle event
    const result = await handleWebhookEvent(payload);

    // Process payment events
    await processLemonSqueezyEvent(payload);

    if (payload.meta.event_name === "order:created") {
      console.log("✅ Premium order created:", {
        email: payload.data.attributes.customer_email,
        amount: payload.data.attributes.total,
        currency: payload.data.attributes.currency,
      });
    }

    if (payload.meta.event_name.includes("subscription")) {
      console.log("✅ Subscription event:", {
        email: payload.data.attributes.customer_email,
        status: payload.data.attributes.status,
      });
    }

    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (err: Error | unknown) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }
}

/**
 * Process LemonSqueezy webhook events and update database
 */
async function processLemonSqueezyEvent(payload: WebhookPayload): Promise<void> {
  const event = payload.meta.event_name;
  const email = payload.data.attributes.customer_email;
  const orderId = payload.data.attributes.order_number?.toString();

  if (!email) {
    console.warn("Webhook event missing customer email");
    return;
  }

  switch (event) {
    case "order:created": {
      // New purchase: create subscription & activate premium
      if (orderId) {
        const sub = await subscriptionOps.createFromLemonSqueezy(
          email,
          orderId,
          "Premium"
        );

        if (sub) {
          console.log("✅ DB: Subscription created & premium activated for:", email);
        } else {
          console.error("❌ DB: Failed to create subscription for:", email);
        }
      }
      break;
    }

    case "order:refunded": {
      // Refund: deactivate premium
      const user = await userOps.getUserByEmail(email);
      if (user) {
        await userOps.setPremium(user.id, false);
        console.log("✅ DB: Premium deactivated (refund) for:", email);
      }
      break;
    }

    case "subscription:created": {
      // Recurring subscription started
      if (orderId) {
        const sub = await subscriptionOps.createFromLemonSqueezy(
          email,
          orderId,
          "Premium"
        );
        if (sub) {
          console.log("✅ DB: Recurring subscription created for:", email);
        }
      }
      break;
    }

    case "subscription:updated": {
      // Subscription status changed
      const status = payload.data.attributes.status || "active";
      const user = await userOps.getUserByEmail(email);
      if (user) {
        const isPremium = status === "active";
        await userOps.setPremium(user.id, isPremium);
        console.log(`✅ DB: Premium ${isPremium ? "activated" : "deactivated"} for:`, email);
      }
      break;
    }

    case "subscription:cancelled":
    case "subscription:paused":
    case "subscription:expired": {
      // Subscription ended: deactivate premium
      const user = await userOps.getUserByEmail(email);
      if (user) {
        await userOps.setPremium(user.id, false);
        console.log(`✅ DB: Premium deactivated (${event}) for:`, email);
      }
      break;
    }

    default:
      console.log(`ℹ️ Unhandled webhook event: ${event}`);
  }
}

