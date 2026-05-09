/**
 * ForgeRealm invoice template.
 * Run: node scripts/generate-invoice.cjs
 * Output: scripts/invoice-preview.pdf
 */

const PDFDocument = require('../backend/node_modules/pdfkit');
const fs   = require('fs');
const path = require('path');

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  darkNavy:    [26,  39,  68],
  ghostBlue:   [243, 247, 253],
  paleBlue:    [232, 240, 251],
  warmAccent:  [232, 148,  74],
  textDark:    [26,  39,  68],
  textMid:     [74,  85, 104],
  textLight:   [113, 128, 150],
  divider:     [210, 220, 232],
  white:       [255, 255, 255],
  paidGreenBg: [212, 237, 218],
  paidGreen:   [40,  167,  69],
  headerSub:   [136, 153, 187],
};

const FONTS = path.join(__dirname, 'fonts');
const LOGO  = path.join(__dirname, '../public/frlogorv.png');

const invoice = {
  number:     '#FR-2026-0042',
  date:       '8 May 2026',
  due:        '22 May 2026',
  from: { name: 'ForgeRealm', city: 'Leeds, United Kingdom', tagline: '3D Printed Miniatures & Fantasy Props' },
  to:   { name: 'James Hargreaves', role: 'Customer', email: 'james.h@example.com' },
  items: [
    { desc: 'Dragon Knight Figurine (200mm)',       detail: 'High-detail FDM print, biodegradable PLA, hand-finished base.', qty: 2, rate: 3400 },
    { desc: 'Custom D&D Party Set (×5 minis)',      detail: 'Bespoke sculpt set from customer-provided character sheets.',   qty: 1, rate: 8500 },
    { desc: 'Prototype Enclosure — Bespoke Design', detail: 'Functional enclosure with snap-fit lid, customer spec.',        qty: 1, rate: 6000 },
  ],
  shipping: 499,
  paid: true, paidDate: '8 May 2026', paidMethod: 'Stripe',
  note: 'Thank you for your order, James. All prints are crafted from biodegradable PLA and dispatched within 3-5 business days. Reach out anytime at info@forgerealm.co.uk.',
};

const gbp      = (n) => `£${(n / 100).toFixed(2)}`;
const subtotal = invoice.items.reduce((s, i) => s + i.qty * i.rate, 0);
const total    = subtotal + invoice.shipping;

const OUT = path.join(__dirname, 'invoice-preview.pdf');
const doc = new PDFDocument({ size: 'A4', margin: 0, info: { Title: invoice.number, Author: 'ForgeRealm' } });
doc.pipe(fs.createWriteStream(OUT));

doc.registerFont('Lora',         path.join(FONTS, 'Lora-Regular.ttf'));
doc.registerFont('Lora-Italic',  path.join(FONTS, 'Lora-Italic.ttf'));
doc.registerFont('Poppins',      path.join(FONTS, 'Poppins-Regular.ttf'));
doc.registerFont('Poppins-Med',  path.join(FONTS, 'Poppins-Medium.ttf'));
doc.registerFont('Poppins-Bold', path.join(FONTS, 'Poppins-Bold.ttf'));
doc.registerFont('Poppins-Lgt',  path.join(FONTS, 'Poppins-Light.ttf'));

const W   = 595.28;
const H   = 841.89;
const PAD = 40;

// helpers — PDFKit (0,0) is TOP-LEFT, y increases downward
const bg    = (x, y, w, h, col)      => doc.rect(x, y, w, h).fill(col);
const rr    = (x, y, w, h, r, col)   => doc.roundedRect(x, y, w, h, r).fill(col);
const ln    = (x1, y1, x2, y2, col)  => doc.moveTo(x1, y1).lineTo(x2, y2).lineWidth(0.5).strokeColor(col).stroke();
const f     = (name, size)            => doc.font(name).fontSize(size);

// ── White background ──────────────────────────────────────────────────────────
bg(0, 0, W, H, C.white);

// ── Watermark (centred, very faint) ──────────────────────────────────────────
if (fs.existsSync(LOGO)) {
  doc.save();
  doc.opacity(0.04);
  const wm = 300;
  doc.image(LOGO, (W - wm) / 2, (H - wm) / 2, { width: wm, height: wm });
  doc.restore();
}

// ── HEADER (top of page) ──────────────────────────────────────────────────────
const HDR_H = 112;
bg(0, 0, W, HDR_H, C.darkNavy);
bg(0, HDR_H, W, 3, C.warmAccent);   // orange stripe below header

if (fs.existsSync(LOGO)) {
  doc.image(LOGO, 35, 28, { width: 52, height: 52 });
}
f('Lora', 26).fillColor(C.white).text('ForgeRealm', 97, 33);
f('Poppins-Lgt', 8.5).fillColor(C.headerSub).text('Crafted Creations  •  Leeds, UK', 98, 62);

f('Poppins-Med', 11).fillColor(C.warmAccent)
  .text('RECEIPT', 0, 38, { align: 'right', width: W - 40 });
f('Poppins', 8.5).fillColor(C.headerSub)
  .text(invoice.number, 0, 57, { align: 'right', width: W - 40 })
  .text(invoice.date,   0, 70, { align: 'right', width: W - 40 });

// ── FROM / BILLED TO ──────────────────────────────────────────────────────────
let y = HDR_H + 3 + 28;   // just below orange stripe

f('Poppins-Med', 7.5).fillColor(C.textLight).text('FROM', PAD, y, { characterSpacing: 1 });
f('Poppins-Med', 10.5).fillColor(C.textDark).text(invoice.from.name, PAD, y + 14);
f('Poppins', 8.5).fillColor(C.textMid)
  .text(invoice.from.city,    PAD, y + 29)
  .text(invoice.from.tagline, PAD, y + 42);

f('Poppins-Med', 7.5).fillColor(C.textLight).text('BILLED TO', 320, y, { characterSpacing: 1 });
f('Poppins-Med', 10.5).fillColor(C.textDark).text(invoice.to.name, 320, y + 14);
f('Poppins', 8.5).fillColor(C.textMid)
  .text(invoice.to.role,  320, y + 29)
  .text(invoice.to.email, 320, y + 42);

y += 72;
ln(PAD, y, W - PAD, y, C.divider);

// ── TABLE ─────────────────────────────────────────────────────────────────────
const TABLE_W  = W - PAD * 2;
const COL_QTY  = W - PAD - 220;
const COL_RATE = W - PAD - 130;
const COL_AMT  = W - PAD - 10;

y += 18;
rr(PAD, y, TABLE_W, 27, 4, C.ghostBlue);
f('Poppins-Med', 7.5).fillColor(C.textLight)
  .text('DESCRIPTION', PAD + 10, y + 9, { characterSpacing: 1 })
  .text('QTY',    COL_QTY - 10,  y + 9, { width: 30, align: 'right', characterSpacing: 1 })
  .text('RATE',   COL_RATE - 20, y + 9, { width: 60, align: 'right', characterSpacing: 1 })
  .text('AMOUNT', COL_AMT - 45,  y + 9, { width: 55, align: 'right', characterSpacing: 1 });

y += 27;

invoice.items.forEach((item, i) => {
  const rowH  = 52;
  const rowBg = i % 2 === 0 ? C.ghostBlue : C.paleBlue;
  bg(PAD, y, TABLE_W, rowH, rowBg);

  f('Poppins-Med', 9.5).fillColor(C.textDark)
    .text(item.desc, PAD + 10, y + 10, { width: COL_QTY - PAD - 20 });
  f('Poppins', 7.8).fillColor(C.textMid)
    .text(item.detail, PAD + 10, y + 24, { width: COL_QTY - PAD - 20, lineGap: 2 });

  f('Poppins', 9.5).fillColor(C.textDark)
    .text(String(item.qty),            COL_QTY - 10,  y + 10, { width: 30, align: 'right' })
    .text(gbp(item.rate),              COL_RATE - 20, y + 10, { width: 60, align: 'right' })
    .text(gbp(item.qty * item.rate),   COL_AMT - 45,  y + 10, { width: 55, align: 'right' });

  y += rowH;
});

ln(PAD, y, W - PAD, y, C.divider);

// ── TOTALS ────────────────────────────────────────────────────────────────────
const TOT_X = 330;
const TOT_W = W - PAD - TOT_X;

y += 18;
f('Poppins', 9).fillColor(C.textMid).text('Subtotal', TOT_X, y);
f('Poppins', 9).fillColor(C.textDark).text(gbp(subtotal), TOT_X, y, { width: TOT_W, align: 'right' });

y += 20;
f('Poppins', 9).fillColor(C.textMid).text('Shipping', TOT_X, y);
f('Poppins', 9).fillColor(C.textDark).text(invoice.shipping === 0 ? 'Free' : gbp(invoice.shipping), TOT_X, y, { width: TOT_W, align: 'right' });

y += 14;
ln(TOT_X, y, W - PAD, y, C.divider);

y += 10;
rr(TOT_X - 10, y, TOT_W + 20, 36, 5, C.darkNavy);
f('Poppins-Med', 10).fillColor(C.white).text('Total Due', TOT_X, y + 10);
f('Poppins-Bold', 14).fillColor(C.white).text(gbp(total), TOT_X, y + 8, { width: TOT_W, align: 'right' });

// ── PAID STAMP ────────────────────────────────────────────────────────────────
y += 54;
if (invoice.paid) {
  rr(PAD, y, 76, 28, 4, C.paidGreenBg);
  f('Poppins-Bold', 10).fillColor(C.paidGreen).text('PAID', PAD + 17, y + 8);
  f('Poppins', 8.5).fillColor(C.textMid)
    .text(`Payment received on ${invoice.paidDate}`, PAD + 90, y + 4)
    .text(`via ${invoice.paidMethod}`, PAD + 90, y + 16);
}

// ── NOTES ─────────────────────────────────────────────────────────────────────
y += 48;
ln(PAD, y, W - PAD, y, C.divider);

y += 14;
f('Poppins-Med', 7.5).fillColor(C.textLight).text('NOTES', PAD, y, { characterSpacing: 1 });
y += 16;
f('Lora-Italic', 9.5).fillColor(C.textMid)
  .text(`"${invoice.note}"`, PAD, y, { width: W - PAD * 2, lineGap: 4 });

// ── FOOTER (bottom of page) ───────────────────────────────────────────────────
bg(0, H - 50, W, 50, C.ghostBlue);
bg(0, H - 50, W, 1.5, C.darkNavy);
f('Poppins', 7).fillColor(C.textLight)
  .text('ForgeRealm  •  Leeds, United Kingdom  •  Crafted with passion', 0, H - 28, { align: 'center', width: W });

doc.end();
console.log(`Invoice written → ${OUT}`);
