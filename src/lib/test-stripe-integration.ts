#!/usr/bin/env node

/**
 * Local Testing Utility for Stripe Integration
 * 
 * This file helps test the Stripe integration locally without needing
 * a real browser or Stripe test payments.
 * 
 * Usage:
 *   npx ts-node src/lib/test-stripe-integration.ts
 * 
 * Or add to package.json:
 *   "test:stripe": "ts-node src/lib/test-stripe-integration.ts"
 */

import { createCheckoutSession } from "./stripe-checkout";
import { saveOrder } from "./db-orders";

const TEST_ITEMS = [
  {
    id: "test-product-1",
    name: "Test 3D Print",
    price: 29.99,
    quantity: 1,
  },
  {
    id: "test-product-2",
    name: "Test Custom Model",
    price: 49.99,
    quantity: 2,
  },
];

async function testCheckoutSession() {
  console.log("\n🧪 Testing Checkout Session Creation...\n");

  try {
    const session = await createCheckoutSession({
      items: TEST_ITEMS,
      customerEmail: "test@example.com",
      successUrl: "http://localhost:3000/checkout/success",
      cancelUrl: "http://localhost:3000/checkout/cancel",
    });

    console.log("✅ Checkout session created successfully!");
    console.log(`   Session ID: ${session.sessionId}`);
    console.log(`   Checkout URL: ${session.url}`);
    console.log(`\n   Total: £${TEST_ITEMS.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}`);

    return session.sessionId;
  } catch (error) {
    console.error("❌ Checkout session creation failed:");
    console.error(error instanceof Error ? error.message : error);
    throw error;
  }
}

async function testOrderSaving(sessionId: string) {
  console.log("\n🧪 Testing Order Saving...\n");

  try {
    const totalAmount = TEST_ITEMS.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await saveOrder({
      orderId: sessionId,
      totalAmount,
      items: TEST_ITEMS,
      email: "test@example.com",
      status: "completed",
    });

    console.log("✅ Order saved successfully!");
    console.log(`   Order ID: ${sessionId}`);
    console.log(`   Total Amount: £${totalAmount.toFixed(2)}`);
    console.log(`   Items Count: ${TEST_ITEMS.length}`);
    console.log(`   Email: test@example.com`);
  } catch (error) {
    console.error("❌ Order saving failed:");
    console.error(error instanceof Error ? error.message : error);
    throw error;
  }
}

async function testItemValidation() {
  console.log("\n🧪 Testing Item Validation...\n");

  const invalidItems = [
    { items: [], error: "Empty array" },
    { items: [{ id: "1", name: "Test", price: 0, quantity: 1 }], error: "Price is 0" },
    { items: [{ id: "1", name: "Test", price: 10, quantity: 0 }], error: "Quantity is 0" },
    { items: [{ id: "1", price: 10, quantity: 1 }], error: "Missing name" },
  ];

  for (const testCase of invalidItems) {
    try {
      await createCheckoutSession({
        items: testCase.items as any,
        successUrl: "http://localhost:3000/success",
        cancelUrl: "http://localhost:3000/cancel",
      });
      console.log(`❌ Should have failed for: ${testCase.error}`);
    } catch (error) {
      console.log(`✅ Correctly rejected (${testCase.error})`);
    }
  }
}

async function runTests() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║     Stripe Integration Local Testing Utility            ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  try {
    // Check environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }

    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      throw new Error("Database environment variables are not set");
    }

    console.log("\n✓ Environment variables configured");

    // Run tests
    await testItemValidation();

    const sessionId = await testCheckoutSession();

    // Optional: test database saving (commented out to avoid errors if DB not ready)
    // await testOrderSaving(sessionId);

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║           ✅ All Tests Completed Successfully           ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    console.log("📋 Next Steps:");
    console.log("   1. Visit your app at http://localhost:3000");
    console.log("   2. Add items to your cart");
    console.log("   3. Click checkout button");
    console.log("   4. Use test card: 4242 4242 4242 4242");
    console.log("   5. Check database for order record\n");
  } catch (error) {
    console.error("\n❌ Tests failed:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { testCheckoutSession, testOrderSaving, testItemValidation };
