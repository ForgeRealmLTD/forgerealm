import { stripe } from "./stripe";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CheckoutSessionData {
  items: CartItem[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

/**
 * Creates a Stripe checkout session
 * @param data - Checkout session data including items and URLs
 * @returns Stripe checkout session with URL
 */
export async function createCheckoutSession(
  data: CheckoutSessionData
): Promise<{ url: string | null; sessionId: string }> {
  // Validate cart items
  if (!data.items || data.items.length === 0) {
    throw new Error("Cart items are required");
  }

  // Validate and sanitize items
  const lineItems = data.items.map((item) => {
    if (!item.id || !item.name || item.price <= 0 || item.quantity <= 0) {
      throw new Error(
        `Invalid item: ${JSON.stringify(item)}. All fields required and price/quantity must be positive.`
      );
    }

    return {
      price_data: {
        currency: "gbp",
        unit_amount: Math.round(item.price * 100), // Convert to pence
        product_data: {
          name: item.name,
          metadata: {
            productId: item.id,
          },
        },
      },
      quantity: item.quantity,
    };
  });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      customer_email: data.customerEmail,
      locale: "en",
      metadata: {
        items: JSON.stringify(data.items),
      },
    });

    return {
      url: session.url,
      sessionId: session.id,
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}
