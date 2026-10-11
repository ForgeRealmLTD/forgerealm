/* Generates the resized WebP copies the blog timeline serves.
   The originals in public/blog/ stay as the masters; the timeline loads
   public/blog/sized/<name>-<width>.webp through srcset instead.
   Run with:  npm run images:blog   (re-run after adding blog photos)
*/
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const BLOG_DIR = path.resolve("public", "blog");
const OUT_DIR = path.join(BLOG_DIR, "sized");
const WIDTHS = [640, 1280];
const SOURCE_EXTS = [".jpg", ".jpeg", ".png"];

const sources = fs
  .readdirSync(BLOG_DIR)
  .filter((f) => SOURCE_EXTS.includes(path.extname(f).toLowerCase()));

fs.mkdirSync(OUT_DIR, { recursive: true });

let written = 0;
for (const file of sources) {
  const src = path.join(BLOG_DIR, file);
  const name = path.parse(file).name;
  const srcTime = fs.statSync(src).mtimeMs;

  for (const width of WIDTHS) {
    const out = path.join(OUT_DIR, `${name}-${width}.webp`);
    if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcTime) continue;

    await sharp(src)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(out);
    written++;
  }
}

console.log(
  `${sources.length} blog images, ${written} variants written to ${OUT_DIR}`,
);
