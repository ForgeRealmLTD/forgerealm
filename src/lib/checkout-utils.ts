/**
 * Frontend checkout utilities for Stripe integration
 */

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * Initiates checkout by calling the create-checkout-session API
 * Redirects user to Stripe Checkout
 *
 * @param items - Array of cart items
 * @param customerEmail - Optional customer email
 * @throws Error if checkout fails
 *
 * @example
 * const items = [
 *   { id: '1', name: 'Product A', price: 29.99, quantity: 1 },
 *   { id: '2', name: 'Product B', price: 49.99, quantity: 2 }
 * ];
 * await initiateCheckout(items, 'customer@example.com');
 */
export async function initiateCheckout(
  items: CartItem[],
  customerEmail?: string
): Promise<void> {
  if (!items || items.length === 0) {
    throw new Error("Cart is empty");
  }

  try {
    // Call API to create checkout session
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items,
        customerEmail,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create checkout session");
    }

    const data = await response.json();

    if (!data.url) {
      throw new Error("No checkout URL received from server");
    }

    // Redirect to Stripe Checkout
    window.location.href = data.url;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout failed";
    console.error("Checkout error:", message);
    throw error;
  }
}

/**
 * Validates cart items before checkout
 * @param items - Items to validate
 * @throws Error if validation fails
 */
export function validateCartItems(items: CartItem[]): void {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart must contain at least one item");
  }

  items.forEach((item, index) => {
    if (!item.id || !item.name) {
      throw new Error(
        `Item ${index + 1} is missing required fields (id, name)`
      );
    }

    if (item.price <= 0) {
      throw new Error(`Item ${index + 1} price must be greater than 0`);
    }

    if (item.quantity <= 0) {
      throw new Error(`Item ${index + 1} quantity must be greater than 0`);
    }
  });
}

/**
 * Formats price for display
 * @param price - Price in GBP
 * @param currency - Currency code (default: GBP)
 * @returns Formatted price string
 */
export function formatPrice(
  price: number,
  currency: string = "GBP"
): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency,
  }).format(price);
}

/**
 * Calculates total cart value
 * @param items - Cart items
 * @returns Total in GBP
 */
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}
