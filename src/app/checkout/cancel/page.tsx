import Link from "next/link";

/**
 * Checkout Cancel Page
 * Displays when user cancels payment
 */
export default function CheckoutCancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-orange-600 mb-2">
          Checkout Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. Your cart has been saved, so you can
          continue shopping anytime.
        </p>

        <div className="space-y-2">
          <Link
            href="/shop"
            className="block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Shop
          </Link>
          <Link
            href="/account"
            className="block px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            View Account
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t text-sm text-gray-600">
          <p>
            Need help?{" "}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
