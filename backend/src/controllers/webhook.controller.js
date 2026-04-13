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

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      await handleCheckoutComplete(stripe, session);
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object;
      await handleRefund(charge);
      break;
    }
    default:
      // Unhandled event type - acknowledge it
      break;
  }

  res.json({ received: true });
});

async function handleCheckoutComplete(stripe, session) {
  // Avoid duplicate processing
  const [existing] = await pool.query(
    'SELECT id FROM orders WHERE stripe_session_id = ? LIMIT 1',
    [session.id]
  );
  if (existing.length > 0) {
    console.log(`Order for session ${session.id} already exists, skipping`);
    return;
  }

  // Get line items from Stripe
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

  // Build items array from line items
  const items = lineItems.data.map((li) => ({
    name: li.description,
    price: li.price.unit_amount,
    qty: li.quantity,
  }));

  // Also try to parse items_json from metadata if available (has product IDs)
  let itemsWithIds = items;
  if (session.metadata?.items_json) {
    try {
      itemsWithIds = JSON.parse(session.metadata.items_json);
    } catch {
      // Fall back to Stripe line items
    }
  }

  const subtotal = session.amount_subtotal || 0;
  const total = session.amount_total || 0;
  const shipping = total - subtotal;

  const customerName = session.metadata?.customer_name || session.customer_details?.name || 'Guest';
  const customerEmail = session.metadata?.customer_email || session.customer_details?.email || '';
  const customerPhone = session.metadata?.customer_phone || session.customer_details?.phone || '';
  const shippingAddress = session.metadata?.shipping_address || '';

  // Try to find a matching user by email
  let userId = null;
  if (customerEmail) {
    const [users] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [customerEmail]
    );
    if (users.length > 0) userId = users[0].id;
  }

  const [result] = await pool.query(
    `INSERT INTO orders (
      user_id, stripe_session_id, stripe_payment_intent, status,
      customer_name, customer_email, customer_phone, shipping_address,
      items_json, subtotal_pence, shipping_pence, total_pence, currency, paid_at
    ) VALUES (?, ?, ?, 'paid', ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      userId,
      session.id,
      session.payment_intent || null,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      JSON.stringify(itemsWithIds),
      subtotal,
      shipping,
      total,
      session.currency || 'gbp',
    ]
  );

  console.log(`Order #${result.insertId} created for session ${session.id}`);

  // Send confirmation email
  if (customerEmail) {
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

async function handleRefund(charge) {
  if (!charge.payment_intent) return;

  const [result] = await pool.query(
    "UPDATE orders SET status = 'refunded' WHERE stripe_payment_intent = ?",
    [charge.payment_intent]
  );

  if (result.affectedRows > 0) {
    console.log(`Order for payment_intent ${charge.payment_intent} marked as refunded`);
  }
}

module.exports = { handleStripeWebhook };
