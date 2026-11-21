import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { shopCatalog } from "../src/data/shopCatalog";

const require = createRequire(import.meta.url);
const {
  priceCart,
  SHIPPING_PENCE,
  FREE_SHIPPING_FROM_PENCE,
} = require("../backend/src/utils/checkout.js");

const CATALOG_JSON = path.resolve("backend/src/data/shop-catalog.json");

describe("backend shop catalog", () => {
  it("matches src/data/products.ts (run `npm run sync:shop-catalog` if not)", () => {
    const backend = JSON.parse(readFileSync(CATALOG_JSON, "utf8"));
    expect(backend).toEqual(shopCatalog());
  });

  it("has unique product IDs", () => {
    const ids = shopCatalog().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

const catalog = [
  { id: "dragon", name: "Dragon", price: 1200, stock: 2, comingSoon: false },
  {
    id: "keyring",
    name: "Keyring",
    price: 300,
    stock: null,
    comingSoon: false,
  },
  { id: "soon", name: "Soon", price: 900, stock: null, comingSoon: true },
  { id: "gone", name: "Gone", price: 900, stock: 0, comingSoon: false },
];

describe("priceCart", () => {
  it("charges catalog prices and ignores a price sent by the browser", () => {
    const { lines, subtotal } = priceCart(
      [{ id: "dragon", qty: 1, price: 1 }],
      catalog,
    );
    expect(lines).toEqual([
      { id: "dragon", name: "Dragon", unitAmount: 1200, qty: 1 },
    ]);
    expect(subtotal).toBe(1200);
  });

  it("adds shipping under the free threshold and none at or above it", () => {
    expect(priceCart([{ id: "keyring", qty: 1 }], catalog).shipping).toBe(
      SHIPPING_PENCE,
    );
    expect(priceCart([{ id: "keyring", qty: 5 }], catalog).subtotal).toBe(
      FREE_SHIPPING_FROM_PENCE,
    );
    expect(priceCart([{ id: "keyring", qty: 5 }], catalog).shipping).toBe(0);
  });

  it("combines repeated lines before checking stock", () => {
    expect(() =>
      priceCart(
        [
          { id: "dragon", qty: 2 },
          { id: "dragon", qty: 1 },
        ],
        catalog,
      ),
    ).toThrow(/Only 2 of Dragon left/);
  });

  it("rejects unknown, coming-soon and sold-out products", () => {
    expect(() => priceCart([{ id: "nope", qty: 1 }], catalog)).toThrow(
      /no longer available/,
    );
    expect(() => priceCart([{ id: "soon", qty: 1 }], catalog)).toThrow(
      /isn't available to buy yet/,
    );
    expect(() => priceCart([{ id: "gone", qty: 1 }], catalog)).toThrow(
      /sold out/,
    );
  });

  it("rejects empty baskets and silly quantities", () => {
    expect(() => priceCart([], catalog)).toThrow(/empty/);
    expect(() => priceCart([{ id: "keyring", qty: 0 }], catalog)).toThrow(
      /quantity/,
    );
    expect(() => priceCart([{ id: "keyring", qty: 1.5 }], catalog)).toThrow(
      /quantity/,
    );
    expect(() => priceCart([{ id: "keyring", qty: 999 }], catalog)).toThrow(
      /quantity/,
    );
  });
});
