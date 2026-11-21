// Writes backend/src/data/shop-catalog.json from src/data/products.ts so the
// backend prices Stripe checkouts from the same data the shop displays.
// Run after changing products: npm run sync:shop-catalog
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "backend/src/data/shop-catalog.json");

const result = await build({
  entryPoints: [resolve(root, "src/data/shopCatalog.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  write: false,
  logLevel: "silent",
});

const source = result.outputFiles[0].text;
const mod = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);
const catalog = mod.shopCatalog();

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Wrote ${catalog.length} products to ${out}`);
