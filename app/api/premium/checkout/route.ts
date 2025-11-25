import { NextRequest, NextResponse } from "next/server";
import { createCheckoutLink } from "@/lib/payments/lemonsqueezy";

/**
 * POST /api/premium/checkout
 * Creates a LemonSqueezy checkout link for premium upgrade
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email || body.userEmail;

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "missing_email" },
        { status: 400 }
      );
    }

    const checkoutUrl = await createCheckoutLink(email);

    if (!checkoutUrl) {
      return NextResponse.json(
        { ok: false, error: "checkout_creation_failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      checkoutUrl,
    });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "internal_error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: true, message: "POST to create checkout link" },
    { status: 200 }
  );
}
