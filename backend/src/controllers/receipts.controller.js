const { ApiError, asyncHandler } = require('../utils/errors');
const { generateInvoicePdf } = require('../utils/invoice');
const pool = require('../config/db');

const TEMPLATE_ORDER = {
  invoiceNumber:   '#FR-TEMPLATE',
  customerName:    'James Hargreaves',
  customerEmail:   'james.h@example.com',
  shippingAddress: '14 Kirkstall Road, Leeds LS3 1HR',
  items: [
    { name: 'Dragon Knight Figurine (200mm)', qty: 2, price: 3400 },
    { name: 'Custom D&D Party Set (×5 minis)', qty: 1, price: 8500 },
    { name: 'Prototype Enclosure — Bespoke Design', qty: 1, price: 6000 },
  ],
  subtotalPence: 21400,
  shippingPence: 499,
  totalPence:    21899,
  createdAt:     new Date(),
};

const listReceipts = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, order_id, invoice_number, customer_name, customer_email,
            subtotal_pence, shipping_pence, total_pence, created_at
     FROM receipts
     ORDER BY created_at DESC`
  );
  res.json(rows);
});

const downloadReceipt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    'SELECT invoice_number, pdf_data FROM receipts WHERE id = ? LIMIT 1',
    [id]
  );
  if (!rows.length || !rows[0].pdf_data) {
    throw new ApiError(404, 'Receipt not found');
  }
  const { invoice_number, pdf_data } = rows[0];
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${invoice_number}.pdf"`);
  res.send(pdf_data);
});

const downloadTemplate = asyncHandler(async (req, res) => {
  const pdf = await generateInvoicePdf(TEMPLATE_ORDER);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="FR-TEMPLATE.pdf"');
  res.send(pdf);
});

module.exports = { listReceipts, downloadReceipt, downloadTemplate };
