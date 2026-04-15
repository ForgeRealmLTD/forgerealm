import { Suspense } from "react";
import Link from "next/link";
import { stripe } from "@/lib/stripe";

/**
 * Checkout Success Page
 * Displays after successful payment
 */

async function CheckoutSuccessContent({
  sessionId,
}: {
  sessionId: string;
}) {
  let session;
  let error;

  try {
    // Retrieve session details from Stripe
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to retrieve session";
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Error Loading Order
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. Your payment has been processed successfully.
        </p>

        {session && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Order ID:</span>
              <br />
              <code className="text-xs bg-white p-2 rounded mt-1 block break-all">
                {session.id}
              </code>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Amount:</span>
              <br />
              £{((session.amount_total || 0) / 100).toFixed(2)}
            </div>
            {session.customer_email && (
              <div className="text-sm text-gray-600 mt-2">
                <span className="font-semibold">Email:</span>
                <br />
                {session.customer_email}
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-600 mb-6">
          A confirmation email has been sent to your registered email address.
        </p>

        <div className="space-y-2">
          <Link
            href="/account/orders"
            className="block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Orders
          </Link>
          <Link
            href="/shop"
            className="block px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccessPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CheckoutSuccessPageContent({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-yellow-600 mb-2">
            Session Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            No session ID was provided. Please try again.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccessContent sessionId={session_id} />
    </Suspense>
  );
}
