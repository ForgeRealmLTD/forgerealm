import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const secretKey = import.meta.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return new Response(
      JSON.stringify({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2025-04-30.basil' });

  try {
    const body = await request.json();
    const { items, customer } = body as {
      items: { id: string; name: string; price: number; qty: number }[];
      customer?: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address1: string;
        address2: string;
        city: string;
        postcode: string;
      };
    };

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No items in cart' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const origin = request.headers.get('origin') || 'http://localhost:4321';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      currency: 'gbp',
      line_items: items.map((item) => ({
        price_data: {
          currency: 'gbp',
          product_data: { name: item.name },
          unit_amount: item.price,
        },
        quantity: item.qty,
      })),
      success_url: `${origin}/shop?success=true`,
      cancel_url: `${origin}/shop?cancelled=true`,
    };

    // Pre-fill customer details from our form
    if (customer?.email) {
      sessionParams.customer_email = customer.email;
    }

    // Add shipping cost if under free threshold
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    if (subtotal < 1500) {
      sessionParams.shipping_options = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 350, currency: 'gbp' },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
      ];
    } else {
      sessionParams.shipping_options = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'gbp' },
            display_name: 'Free Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
      ];
    }

    // Store customer details in metadata for invoicing
    if (customer) {
      sessionParams.metadata = {
        customer_name: `${customer.firstName} ${customer.lastName}`,
        customer_email: customer.email,
        customer_phone: customer.phone || '',
        shipping_address: [customer.address1, customer.address2, customer.city, customer.postcode].filter(Boolean).join(', '),
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Checkout failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
