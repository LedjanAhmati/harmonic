import crypto from "crypto";

const API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const PRODUCT_ID = process.env.LEMONSQUEEZY_PRODUCT_ID;

/**
 * Create a checkout link for the premium product
 * @param email - Customer email (pre-filled in checkout)
 * @returns Checkout URL or null if failed
 */
export async function createCheckoutLink(email?: string): Promise<string | null> {
  try {
    if (!API_KEY || !STORE_ID || !PRODUCT_ID) {
      console.warn("LemonSqueezy: Missing API_KEY, STORE_ID or PRODUCT_ID");
      return null;
    }

    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/stores/${STORE_ID}/checkouts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            type: "checkouts",
            attributes: {
              product_id: parseInt(PRODUCT_ID),
              redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/harmonic/dashboard?payment=success`,
              checkout_data: email
                ? {
                    email: email,
                  }
                : undefined,
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("LemonSqueezy checkout error:", data);
      return null;
    }

    return data.data?.attributes?.url || null;
  } catch (error) {
    console.error("Failed to create LemonSqueezy checkout:", error);
    return null;
  }
}

/**
 * Verify webhook signature from LemonSqueezy
 * @param body - Raw request body
 * @param signature - X-Signature header value
 * @returns true if signature is valid
 */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!webhookSecret) return false;

  const hash = crypto
    .createHmac("sha256", webhookSecret)
    .update(body, "utf8")
    .digest("hex");

  return hash === signature;
}

/**
 * Handle webhook events from LemonSqueezy
 */
export interface WebhookAttribute {
  order_number?: number;
  customer_email?: string;
  total?: number;
  currency?: string;
  status?: string;
  [key: string]: string | number | undefined;
}

export interface WebhookPayload {
  meta: {
    event_name: string;
  };
  data: {
    id: string;
    type: string;
    attributes: WebhookAttribute;
  };
}

export interface WebhookResult {
  success: boolean;
  event: string;
  data?: WebhookPayload["data"];
}

export function parseWebhookPayload(body: string): WebhookPayload | null {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

/**
 * Handle specific webhook events
 */
export async function handleWebhookEvent(payload: WebhookPayload): Promise<WebhookResult> {
  const eventName = payload.meta.event_name;

  switch (eventName) {
    case "order:created":
    case "order:refunded":
    case "subscription:created":
    case "subscription:updated":
    case "subscription:cancelled":
    case "subscription:resumed":
    case "subscription:expired":
    case "subscription:paused":
    case "subscription:unpaused": {
      console.log(`LemonSqueezy webhook: ${eventName}`, payload.data.attributes);
      return {
        success: true,
        event: eventName,
        data: payload.data,
      };
    }

    default:
      console.log(`Unknown LemonSqueezy webhook event: ${eventName}`);
      return { success: false, event: eventName };
  }
}
