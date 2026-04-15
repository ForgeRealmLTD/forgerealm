const Stripe = require('stripe');
const { asyncHandler } = require('../utils/errors');
const { sendOrderConfirmation } = require('../utils/email');
const pool = require('../config/db');

const handleStripeWebhook = asyncHandler(async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    console.error('Stripe webhook: missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Handle events - always return 200 to prevent Stripe retries
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutComplete(stripe, event.data.object);
        break;
      }
      case 'checkout.session.expired': {
        await handleCheckoutExpired(event.data.object);
        break;
      }
      case 'charge.refunded': {
        await handleRefund(event.data.object);
        break;
      }
      case 'payment_intent.payment_failed': {
        await handlePaymentFailed(event.data.object);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    // Log but still return 200 so Stripe doesn't retry
    console.error(`Webhook handler error for ${event.type}:`, err.message);
  }

  res.json({ received: true });
});

async function handleCheckoutComplete(stripe, session) {
  // Duplicate prevention using Tobi's order_id pattern
  const [existing] = await pool.query(
    'SELECT id FROM orders WHERE order_id = ? LIMIT 1',
    [session.id]
  );
  if (existing.length > 0) {
    console.log(`Order for session ${session.id} already exists, skipping`);
    return;
  }

  // Get line items from Stripe
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
  const items = lineItems.data.map((li) => ({
    name: li.description,
    price: li.price.unit_amount,
    qty: li.quantity,
  }));

  // Try metadata items (has product IDs)
  let itemsWithIds = items;
  if (session.metadata?.items_json) {
    try { itemsWithIds = JSON.parse(session.metadata.items_json); } catch {}
  }

  const total = session.amount_total || 0;
  const customerEmail = session.metadata?.customer_email || session.customer_details?.email || '';
  const shippingAddress = session.metadata?.shipping_address || '';

  // Link to user account if possible
  let userId = null;
  if (customerEmail) {
    const [users] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [customerEmail]);
    if (users.length > 0) userId = users[0].id;
  }

  // Insert using Tobi's schema
  const [result] = await pool.query(
    `INSERT INTO orders (order_id, user_id, total_amount, items_json, email, status, shipping_address, created_at)
     VALUES (?, ?, ?, ?, ?, 'completed', ?, NOW())`,
    [
      session.id,
      userId,
      (total / 100).toFixed(2),
      JSON.stringify(itemsWithIds),
      customerEmail,
      shippingAddress,
    ]
  );

  console.log(`Order #${result.insertId} created for session ${session.id}`);

  // Send confirmation email
  if (customerEmail) {
    const subtotal = session.amount_subtotal || 0;
    const shipping = total - subtotal;
    const customerName = session.metadata?.customer_name || session.customer_details?.name || 'Guest';

    try {
      await sendOrderConfirmation({
        order: {
          id: result.insertId,
          customer_name: customerName,
          customer_email: customerEmail,
          shipping_address: shippingAddress,
          items: itemsWithIds,
          subtotal_pence: subtotal,
          shipping_pence: shipping,
          total_pence: total,
        },
      });
      console.log(`Confirmation email sent to ${customerEmail}`);
    } catch (err) {
      console.error('Failed to send order confirmation email:', err.message);
    }
  }
}

async function handleCheckoutExpired(session) {
  // Save expired session for tracking
  const [existing] = await pool.query(
    'SELECT id FROM orders WHERE order_id = ? LIMIT 1',
    [session.id]
  );
  if (existing.length > 0) return;

  const customerEmail = session.metadata?.customer_email || session.customer_details?.email || '';
  const items = session.metadata?.items_json ? JSON.parse(session.metadata.items_json) : [];

  await pool.query(
    `INSERT INTO orders (order_id, total_amount, items_json, email, status, created_at)
     VALUES (?, ?, ?, ?, 'expired', NOW())`,
    [session.id, 0, JSON.stringify(items), customerEmail]
  );

  console.log(`Expired session ${session.id} recorded`);
}

async function handleRefund(charge) {
  if (!charge.payment_intent) return;

  // Find order by searching for the payment intent in the order_id or via Stripe
  const [result] = await pool.query(
    `UPDATE orders SET status = 'refunded', refund_amount = ?, refunded_at = NOW(), updated_at = NOW()
     WHERE order_id IN (SELECT order_id FROM (SELECT order_id FROM orders WHERE order_id LIKE ?) AS t)
     OR order_id = ?`,
    [(charge.amount_refunded / 100).toFixed(2), `%${charge.payment_intent}%`, charge.payment_intent]
  );

  // If no match by payment_intent directly, try via Stripe session lookup
  if (result.affectedRows === 0) {
    console.log(`No order found for refund on payment_intent ${charge.payment_intent}`);
  } else {
    console.log(`Order refunded for payment_intent ${charge.payment_intent}`);
  }
}

async function handlePaymentFailed(paymentIntent) {
  console.log(`Payment failed for intent ${paymentIntent.id}: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`);

  // Update if an order exists for this session
  const [result] = await pool.query(
    "UPDATE orders SET status = 'failed', updated_at = NOW() WHERE order_id = ?",
    [paymentIntent.id]
  );

  if (result.affectedRows > 0) {
    console.log(`Order marked as failed for intent ${paymentIntent.id}`);
  }
}

module.exports = { handleStripeWebhook };
