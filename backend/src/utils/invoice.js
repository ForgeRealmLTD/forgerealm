const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const ASSETS = path.join(__dirname, '../assets');
const FONTS  = path.join(ASSETS, 'fonts');
const LOGO   = path.join(ASSETS, 'frlogorv.png');

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

const gbp = (pence) => `£${(pence / 100).toFixed(2)}`;

/**
 * Generate an invoice PDF for a completed order.
 * Returns a Promise<Buffer>.
 */
const generateInvoicePdf = (order) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, info: { Title: order.invoiceNumber, Author: 'ForgeRealm' } });

    doc.registerFont('Lora',         path.join(FONTS, 'Lora-Regular.ttf'));
    doc.registerFont('Lora-Italic',  path.join(FONTS, 'Lora-Italic.ttf'));
    doc.registerFont('Poppins',      path.join(FONTS, 'Poppins-Regular.ttf'));
    doc.registerFont('Poppins-Med',  path.join(FONTS, 'Poppins-Medium.ttf'));
    doc.registerFont('Poppins-Bold', path.join(FONTS, 'Poppins-Bold.ttf'));
    doc.registerFont('Poppins-Lgt',  path.join(FONTS, 'Poppins-Light.ttf'));

    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = 595.28;
    const H = 841.89;
    const PAD = 40;

    const bg  = (x, y, w, h, col) => doc.rect(x, y, w, h).fill(col);
    const rr  = (x, y, w, h, r, col) => doc.roundedRect(x, y, w, h, r).fill(col);
    const ln  = (x1, y1, x2, y2) => doc.moveTo(x1, y1).lineTo(x2, y2).lineWidth(0.5).strokeColor(C.divider).stroke();
    const f   = (name, size) => doc.font(name).fontSize(size);

    const subtotal = order.subtotalPence;
    const shipping = order.shippingPence;
    const total    = order.totalPence;
    const items    = order.items || [];

    const dateStr = new Date(order.createdAt || Date.now())
      .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    // White background
    bg(0, 0, W, H, C.white);

    // Watermark
    if (fs.existsSync(LOGO)) {
      doc.save();
      doc.opacity(0.04);
      const wm = 300;
      doc.image(LOGO, (W - wm) / 2, (H - wm) / 2, { width: wm, height: wm });
      doc.restore();
    }

    // Header
    const HDR_H = 112;
    bg(0, 0, W, HDR_H, C.darkNavy);
    bg(0, HDR_H, W, 3, C.warmAccent);

    if (fs.existsSync(LOGO)) {
      doc.image(LOGO, 35, 28, { width: 52, height: 52 });
    }
    f('Lora', 26).fillColor(C.white).text('ForgeRealm', 97, 33);
    f('Poppins-Lgt', 8.5).fillColor(C.headerSub).text('Crafted Creations  •  Leeds, UK', 98, 62);

    f('Poppins-Med', 11).fillColor(C.warmAccent)
      .text('RECEIPT', 0, 38, { align: 'right', width: W - 40 });
    f('Poppins', 8.5).fillColor(C.headerSub)
      .text(order.invoiceNumber, 0, 57, { align: 'right', width: W - 40 })
      .text(dateStr, 0, 70, { align: 'right', width: W - 40 });

    // FROM / BILLED TO
    let y = HDR_H + 3 + 28;

    f('Poppins-Med', 7.5).fillColor(C.textLight).text('FROM', PAD, y, { characterSpacing: 1 });
    f('Poppins-Med', 10.5).fillColor(C.textDark).text('ForgeRealm', PAD, y + 14);
    f('Poppins', 8.5).fillColor(C.textMid)
      .text('Leeds, United Kingdom', PAD, y + 29)
      .text('3D Printed Miniatures & Fantasy Props', PAD, y + 42);

    f('Poppins-Med', 7.5).fillColor(C.textLight).text('BILLED TO', 320, y, { characterSpacing: 1 });
    f('Poppins-Med', 10.5).fillColor(C.textDark).text(order.customerName || 'Customer', 320, y + 14);
    f('Poppins', 8.5).fillColor(C.textMid).text(order.customerEmail || '', 320, y + 29);
    if (order.shippingAddress) {
      f('Poppins', 8.5).fillColor(C.textMid).text(order.shippingAddress, 320, y + 42, { width: W - 320 - PAD });
    }

    y += 72;
    ln(PAD, y, W - PAD, y);

    // Table
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

    items.forEach((item, i) => {
      const rowH  = 42;
      const rowBg = i % 2 === 0 ? C.ghostBlue : C.paleBlue;
      const unitPence = item.price || item.unit_price || item.rate || 0;
      const qty = item.qty || item.quantity || 1;
      const name = item.name || item.desc || item.description || 'Item';

      bg(PAD, y, TABLE_W, rowH, rowBg);
      f('Poppins-Med', 9.5).fillColor(C.textDark)
        .text(name, PAD + 10, y + 13, { width: COL_QTY - PAD - 20 });
      f('Poppins', 9.5).fillColor(C.textDark)
        .text(String(qty),          COL_QTY - 10,  y + 13, { width: 30, align: 'right' })
        .text(gbp(unitPence),       COL_RATE - 20, y + 13, { width: 60, align: 'right' })
        .text(gbp(qty * unitPence), COL_AMT - 45,  y + 13, { width: 55, align: 'right' });

      y += rowH;
    });

    ln(PAD, y, W - PAD, y);

    // Totals
    const TOT_X = 330;
    const TOT_W = W - PAD - TOT_X;

    y += 18;
    f('Poppins', 9).fillColor(C.textMid).text('Subtotal', TOT_X, y);
    f('Poppins', 9).fillColor(C.textDark).text(gbp(subtotal), TOT_X, y, { width: TOT_W, align: 'right' });

    y += 20;
    f('Poppins', 9).fillColor(C.textMid).text('Shipping', TOT_X, y);
    f('Poppins', 9).fillColor(C.textDark).text(shipping === 0 ? 'Free' : gbp(shipping), TOT_X, y, { width: TOT_W, align: 'right' });

    y += 14;
    ln(TOT_X, y, W - PAD, y);

    y += 10;
    rr(TOT_X - 10, y, TOT_W + 20, 36, 5, C.darkNavy);
    f('Poppins-Med', 10).fillColor(C.white).text('Total Due', TOT_X, y + 10);
    f('Poppins-Bold', 14).fillColor(C.white).text(gbp(total), TOT_X, y + 8, { width: TOT_W, align: 'right' });

    // Paid stamp
    y += 54;
    rr(PAD, y, 76, 28, 4, C.paidGreenBg);
    f('Poppins-Bold', 10).fillColor(C.paidGreen).text('PAID', PAD + 17, y + 8);
    f('Poppins', 8.5).fillColor(C.textMid)
      .text(`Payment received on ${dateStr}`, PAD + 90, y + 4)
      .text('via Stripe', PAD + 90, y + 16);

    // Notes
    y += 48;
    ln(PAD, y, W - PAD, y);
    y += 14;
    f('Poppins-Med', 7.5).fillColor(C.textLight).text('NOTES', PAD, y, { characterSpacing: 1 });
    y += 16;
    f('Lora-Italic', 9.5).fillColor(C.textMid).text(
      'Thank you for your order. All prints are crafted from biodegradable PLA and dispatched within 3-5 business days. Questions? Reply to this email or contact info@forgerealm.co.uk.',
      PAD, y, { width: W - PAD * 2, lineGap: 4 }
    );

    // Footer
    bg(0, H - 50, W, 50, C.ghostBlue);
    bg(0, H - 50, W, 1.5, C.darkNavy);
    f('Poppins', 7).fillColor(C.textLight)
      .text('ForgeRealm  •  Leeds, United Kingdom  •  Crafted with passion', 0, H - 28, { align: 'center', width: W });

    doc.end();
  });

module.exports = { generateInvoicePdf };
