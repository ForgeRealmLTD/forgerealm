/* One-off: convert stall 7 (HEIC) + stall 8 (PNG) into the blog folder as JPGs.
   Run with:  node scripts/import-stall-images.cjs
*/
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const heicConvert = require('heic-convert');
const sharp = require('sharp');

const TMP = os.tmpdir();
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(REPO_ROOT, 'public', 'blog');

// Maps each input file to its canonical name in public/blog/.
// First image per stall gets the unprefixed name; subsequent ones get the
// numeric prefix that matches the existing `2albionStall1`-style convention.
const JOBS = [
  { src: path.join(TMP, 'stall7_extract', 'IMG_1500.HEIC'), out: 'stall7.jpg',  kind: 'heic' },
  { src: path.join(TMP, 'stall7_extract', 'IMG_1502.HEIC'), out: '2stall7.jpg', kind: 'heic' },
  { src: path.join(TMP, 'stall7_extract', 'IMG_1504.HEIC'), out: '3stall7.jpg', kind: 'heic' },
  { src: path.join(TMP, 'stall8_extract', 'IMG_1557.PNG'),  out: 'stall8.jpg',  kind: 'png'  },
  { src: path.join(TMP, 'stall8_extract', 'IMG_1559.PNG'),  out: '2stall8.jpg', kind: 'png'  },
];

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const job of JOBS) {
    if (!fs.existsSync(job.src)) {
      console.warn(`[skip] missing: ${job.src}`);
      continue;
    }
    const outPath = path.join(OUT_DIR, job.out);

    let buffer;
    if (job.kind === 'heic') {
      const inputBuffer = fs.readFileSync(job.src);
      buffer = await heicConvert({ buffer: inputBuffer, format: 'JPEG', quality: 0.85 });
    } else {
      buffer = fs.readFileSync(job.src);
    }

    // Pipe through sharp to:
    //  - normalise to JPEG (PNGs need converting; HEIC->JPEG already done above)
    //  - clamp longest edge to 2400px (stall photos don't need 4K detail)
    //  - strip EXIF so we don't leak iPhone/GPS metadata to the public folder
    await sharp(buffer)
      .rotate() // honour EXIF orientation before strip
      .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(outPath);

    const { size } = fs.statSync(outPath);
    console.log(`[ok]  ${job.out}  (${Math.round(size / 1024)} KB)`);
  }
})().catch((err) => {
  console.error('[failed]', err);
  process.exit(1);
});
