import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import {
  saveOrder,
  updateOrderStatus,
  getOrderByStripeId,
} from "@/lib/db-orders";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set");
}

/**
 * POST /api/webhook
 * Stripe webhook endpoint for payment events
 *
 * Handles:
 * - checkout.session.completed: Payment successful, order confirmed
 * - checkout.session.expired: Checkout session expired, no payment made
 * - charge.refunded: Payment refunded by customer or merchant
 * - payment_intent.payment_failed: Payment attempt failed
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();

    // Get Stripe signature from headers
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid signature";
      console.error("Webhook signature verification failed:", message);

      return NextResponse.json(
        { error: `Webhook Error: ${message}` },
        { status: 400 }
      );
    }

    // Route to appropriate handler based on event type
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "checkout.session.expired":
        await handleCheckoutSessionExpired(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "charge.refunded":
        await handleChargeRefunded(
          event.data.object as Stripe.Charge
        );
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      default:
        // Log unhandled events for monitoring
        console.log(`Received unhandled Stripe event: ${event.type}`);
    }

    // Return success response to Stripe
    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handles successful checkout completion
 * Creates order record in database
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    // Parse items from metadata
    const itemsString = session.metadata?.items;
    const items = itemsString ? JSON.parse(itemsString) : [];

    // Calculate total amount in GBP (session.amount_total is in pence)
    const totalAmount = (session.amount_total || 0) / 100;

    // Save order to database
    await saveOrder({
      orderId: session.id,
      totalAmount,
      items,
      email: session.customer_email || "unknown@example.com",
      status: "completed",
    });

    console.log(`✅ Order completed: ${session.id} (£${totalAmount.toFixed(2)})`);

    // Optional: Send confirmation email here
    // await sendConfirmationEmail({
    //   email: session.customer_email,
    //   orderId: session.id,
    //   totalAmount,
    //   items,
    // });
  } catch (error) {
    console.error("Error processing checkout.session.completed:", error);
    throw error;
  }
}

/**
 * Handles checkout session expiration
 * Updates order status or logs event
 */
async function handleCheckoutSessionExpired(
  session: Stripe.Checkout.Session
) {
  try {
    // Try to find existing order
    const existingOrder = await getOrderByStripeId(session.id);

    if (existingOrder) {
      // If order exists, mark it as expired
      await updateOrderStatus(session.id, "expired");
      console.log(`⏱️ Order expired: ${session.id}`);
    } else {
      // If no order yet, log the expiration
      console.log(`⏱️ Checkout session expired (no order created): ${session.id}`);
    }

    // Optional: Send expiration reminder email
    // await sendExpirationEmail({
    //   email: session.customer_email,
    //   sessionId: session.id,
    // });
  } catch (error) {
    console.error("Error processing checkout.session.expired:", error);
    throw error;
  }
}

/**
 * Handles charge refunds
 * Updates order status to refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    // Try to find order by charge metadata or ID
    const chargeMetadata = charge.metadata?.order_id || charge.id;

    // Find the order by charge ID if available
    const existingOrder = await getOrderByStripeId(chargeMetadata);

    if (existingOrder) {
      // Update order status to refunded
      await updateOrderStatus(existingOrder.order_id, "refunded");

      const refundAmount = charge.amount_refunded / 100;
      console.log(
        `💰 Charge refunded: ${charge.id} (£${refundAmount.toFixed(2)})`
      );

      // Optional: Send refund confirmation email
      // await sendRefundEmail({
      //   email: existingOrder.email,
      //   orderId: existingOrder.order_id,
      //   refundAmount,
      // });
    } else {
      console.log(`💰 Charge refunded (order not found): ${charge.id}`);
    }
  } catch (error) {
    console.error("Error processing charge.refunded:", error);
    throw error;
  }
}

/**
 * Handles payment intent failures
 * Updates order status to failed or logs failure
 */
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    // Get charge from payment intent
    const chargeId = paymentIntent.charges.data[0]?.id;

    if (chargeId) {
      const existingOrder = await getOrderByStripeId(chargeId);

      if (existingOrder) {
        // Update order status to failed
        await updateOrderStatus(existingOrder.order_id, "failed");
        console.log(
          `❌ Payment failed for order: ${existingOrder.order_id}`
        );

        // Optional: Send payment failure notification
        // await sendPaymentFailureEmail({
        //   email: existingOrder.email,
        //   orderId: existingOrder.order_id,
        //   reason: paymentIntent.last_payment_error?.message,
        // });
      }
    } else {
      const failureMessage =
        paymentIntent.last_payment_error?.message || "Unknown error";
      console.log(`❌ Payment failed: ${failureMessage}`);
    }
  } catch (error) {
    console.error("Error processing payment_intent.payment_failed:", error);
    throw error;
  }
}

/**
 * GET /api/webhook
 * Health check for webhook endpoint
 */
export async function GET() {
  return NextResponse.json(
    { message: "Stripe webhook endpoint is active" },
    { status: 200 }
  );
}
