import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe-checkout";

/**
 * POST /api/create-checkout-session
 * Creates a Stripe checkout session
 *
 * Request body:
 * {
 *   items: [{ id: string, name: string, price: number, quantity: number }],
 *   customerEmail?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 }
      );
    }

    // Get base URL from request
    const baseUrl = request.headers.get("origin") || "http://localhost:3000";

    // Create checkout session
    const session = await createCheckoutSession({
      items: body.items,
      customerEmail: body.customerEmail,
      successUrl: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/checkout/cancel`,
    });

    return NextResponse.json(
      {
        url: session.url,
        sessionId: session.sessionId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Checkout session error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create checkout session";

    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && message.includes("Invalid item") ? 400 : 500 }
    );
  }
}
