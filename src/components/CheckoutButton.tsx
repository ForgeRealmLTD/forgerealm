"use client";

/**
 * Example React component for Stripe checkout button
 * This can be adapted to fit your specific component structure
 */

import { useState } from "react";
import { initiateCheckout, validateCartItems } from "@/lib/checkout-utils";
import type { CartItem } from "@/lib/checkout-utils";

interface CheckoutButtonProps {
  items: CartItem[];
  customerEmail?: string;
  buttonLabel?: string;
  className?: string;
}

/**
 * Checkout button component that initiates Stripe payment flow
 */
export function CheckoutButton({
  items,
  customerEmail,
  buttonLabel = "Proceed to Checkout",
  className = "",
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setError(null);
    setLoading(true);

    try {
      // Validate items before checkout
      validateCartItems(items);

      // Initiate checkout
      await initiateCheckout(items, customerEmail);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      setError(message);
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
        className={`
          px-6 py-3 font-semibold rounded-lg
          bg-blue-600 text-white
          hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
          transition-colors duration-200
          ${className}
        `}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          buttonLabel
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Example usage component showing how to use CheckoutButton
 */
export function CheckoutExample() {
  const [cartItems] = useState<CartItem[]>([
    {
      id: "product-1",
      name: "Custom 3D Print",
      price: 29.99,
      quantity: 1,
    },
    {
      id: "product-2",
      name: "Eco-Friendly PLA Print",
      price: 49.99,
      quantity: 2,
    },
  ]);

  return (
    <div className="w-full max-w-md mx-auto p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

      <div className="space-y-2 mb-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>£{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>
            £
            {cartItems
              .reduce((sum, item) => sum + item.price * item.quantity, 0)
              .toFixed(2)}
          </span>
        </div>
      </div>

      <CheckoutButton items={cartItems} customerEmail="user@example.com" />
    </div>
  );
}
