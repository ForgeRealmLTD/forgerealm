// The subset of product data the backend needs to price a Stripe checkout.
// The backend can't import this TypeScript, so `npm run sync:shop-catalog`
// writes it to backend/src/data/shop-catalog.json, and a test fails if the
// two ever drift apart (e.g. a price change that wasn't synced).
import { products, type Product } from "./products";

export type CatalogEntry = {
  id: string;
  name: string;
  price: number; // pence
  stock: number | null; // null = made to order, no limit
  comingSoon: boolean;
};

export const toCatalogEntry = (p: Product): CatalogEntry => ({
  id: p.id,
  name: p.name,
  price: p.price,
  stock: p.stock,
  comingSoon: p.badge === "Coming Soon",
});

export const shopCatalog = (): CatalogEntry[] => products.map(toCatalogEntry);
