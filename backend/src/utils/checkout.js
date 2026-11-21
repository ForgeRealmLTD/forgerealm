const catalog = require("../data/shop-catalog.json");
const { ApiError } = require("./errors");

// Shipping rules shown in the shop: £3.50, free from £15
const SHIPPING_PENCE = 350;
const FREE_SHIPPING_FROM_PENCE = 1500;
const MAX_QTY_PER_LINE = 20;
const MAX_LINES = 50;

/**
 * Price a cart from our own catalog. The browser only tells us WHICH products
 * and HOW MANY; every price comes from the catalog, so an edited request can't
 * change what the customer pays. Any extra fields (e.g. a `price`) are ignored.
 *
 * @param {unknown} rawItems  [{ id, qty }, ...] from the request body
 * @param {Array} products    catalog entries (defaults to shop-catalog.json)
 * @returns {{ lines: {id,name,unitAmount,qty}[], subtotal: number, shipping: number }}
 */
function priceCart(rawItems, products = catalog) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new ApiError(400, "Your basket is empty");
  }
  if (rawItems.length > MAX_LINES) {
    throw new ApiError(400, "Too many items in one order");
  }

  const byId = new Map(products.map((p) => [p.id, p]));
  const qtyById = new Map();

  for (const raw of rawItems) {
    const id = typeof raw?.id === "string" ? raw.id : "";
    const qty = Number(raw?.qty);
    const product = byId.get(id);
    if (!product) {
      throw new ApiError(
        400,
        "Something in your basket is no longer available. Please remove it and try again.",
      );
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
      throw new ApiError(
        400,
        `Please choose a quantity between 1 and ${MAX_QTY_PER_LINE}`,
      );
    }
    // Same product listed twice: combine before checking stock
    qtyById.set(id, (qtyById.get(id) || 0) + qty);
  }

  const lines = [];
  for (const [id, qty] of qtyById) {
    const product = byId.get(id);
    if (product.comingSoon) {
      throw new ApiError(400, `${product.name} isn't available to buy yet`);
    }
    if (product.stock !== null && qty > product.stock) {
      throw new ApiError(
        400,
        product.stock === 0
          ? `${product.name} is sold out`
          : `Only ${product.stock} of ${product.name} left`,
      );
    }
    lines.push({ id, name: product.name, unitAmount: product.price, qty });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.unitAmount * l.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_FROM_PENCE ? 0 : SHIPPING_PENCE;
  return { lines, subtotal, shipping };
}

module.exports = {
  priceCart,
  SHIPPING_PENCE,
  FREE_SHIPPING_FROM_PENCE,
  MAX_QTY_PER_LINE,
};
