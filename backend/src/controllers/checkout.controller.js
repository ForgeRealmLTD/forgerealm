const Stripe = require("stripe");
const { ApiError, asyncHandler } = require("../utils/errors");
const { priceCart } = require("../utils/checkout");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Where Stripe sends the customer back to. Local/preview origins are only
// honoured if they're ones we already trust for CORS; otherwise production.
const RETURN_ORIGINS = new Set([
  "https://forgerealm.co.uk",
  "https://www.forgerealm.co.uk",
  "https://forgerealm.vercel.app",
  "http://localhost:4321",
]);

// Trim, collapse whitespace, cap length (Stripe metadata values max 500 chars)
const oneLine = (value, max) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

let stripeClient = null;
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeClient) stripeClient = new Stripe(key);
  return stripeClient;
};

const createCheckout = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    console.error("Checkout: STRIPE_SECRET_KEY is not set");
    throw new ApiError(
      503,
      "Checkout is unavailable right now. Please try again later.",
    );
  }

  const { lines, shipping } = priceCart(req.body?.items);

  const c = req.body?.customer || {};
  const customer = {
    firstName: oneLine(c.firstName, 80),
    lastName: oneLine(c.lastName, 80),
    email: oneLine(c.email, 254),
    phone: oneLine(c.phone, 40),
    address1: oneLine(c.address1, 120),
    address2: oneLine(c.address2, 120),
    city: oneLine(c.city, 80),
    postcode: oneLine(c.postcode, 16),
  };
  if (!customer.firstName || !customer.lastName) {
    throw new ApiError(400, "Please add your name");
  }
  if (!EMAIL_RE.test(customer.email)) {
    throw new ApiError(400, "Please add a valid email address");
  }
  if (!customer.address1 || !customer.city || !customer.postcode) {
    throw new ApiError(400, "Please add your delivery address");
  }

  const origin = req.get("origin");
  const base = RETURN_ORIGINS.has(origin)
    ? origin
    : process.env.APP_BASE_URL || "https://forgerealm.co.uk";

  const session = await stripe.checkout.sessions
    .create({
      mode: "payment",
      currency: "gbp",
      customer_email: customer.email,
      line_items: lines.map((line) => ({
        quantity: line.qty,
        price_data: {
          currency: "gbp",
          unit_amount: line.unitAmount,
          product_data: {
            name: line.name,
            // Read back by the webhook so orders keep their product IDs
            metadata: { product_id: line.id },
          },
        },
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shipping, currency: "gbp" },
            display_name:
              shipping === 0 ? "Free Shipping" : "Standard Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 5 },
            },
          },
        },
      ],
      metadata: {
        customer_name: `${customer.firstName} ${customer.lastName}`,
        customer_email: customer.email,
        ...(customer.phone ? { customer_phone: customer.phone } : {}),
        shipping_address: [
          customer.address1,
          customer.address2,
          customer.city,
          customer.postcode,
        ]
          .filter(Boolean)
          .join(", "),
      },
      success_url: `${base}/shop?success=true`,
      cancel_url: `${base}/shop?cancelled=true`,
    })
    .catch((err) => {
      console.error("Stripe checkout session failed:", err?.message || err);
      throw new ApiError(
        502,
        "Checkout is unavailable right now. Please try again later.",
      );
    });

  res.json({ url: session.url });
});

module.exports = { createCheckout };
