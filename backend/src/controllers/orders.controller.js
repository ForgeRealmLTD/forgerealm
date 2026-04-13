const { ApiError, asyncHandler } = require('../utils/errors');
const pool = require('../config/db');

const getOrdersByUser = asyncHandler(async (req, res) => {
  const { userId, username, role } = req.user;

  // Try matching by user_id first, then by email
  let orders;
  if (userId && !String(userId).startsWith('env:')) {
    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    orders = rows;
  } else {
    // Fallback: no linked orders for env admins
    orders = [];
  }

  // Parse items_json for each order
  const parsed = orders.map((o) => ({
    ...o,
    items: typeof o.items_json === 'string' ? JSON.parse(o.items_json) : o.items_json,
  }));

  res.json({ orders: parsed });
});

const getOrderByEmail = asyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) throw new ApiError(400, 'Email is required');

  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC',
    [email]
  );

  const parsed = rows.map((o) => ({
    ...o,
    items: typeof o.items_json === 'string' ? JSON.parse(o.items_json) : o.items_json,
  }));

  res.json({ orders: parsed });
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [id]);
  const order = rows[0];
  if (!order) throw new ApiError(404, 'Order not found');

  // Verify ownership: must be admin, or match user_id, or match email
  const { userId, role } = req.user;
  if (role !== 'admin' && order.user_id !== userId) {
    throw new ApiError(403, 'Access denied');
  }

  order.items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json;
  res.json({ order });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
  const offset = (Math.max(1, Number(page)) - 1) * Number(limit);

  let query = 'SELECT * FROM orders';
  const params = [];

  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), offset);

  const [rows] = await pool.query(query, params);

  const parsed = rows.map((o) => ({
    ...o,
    items: typeof o.items_json === 'string' ? JSON.parse(o.items_json) : o.items_json,
  }));

  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM orders';
  const countParams = [];
  if (status) {
    countQuery += ' WHERE status = ?';
    countParams.push(status);
  }
  const [[{ total }]] = await pool.query(countQuery, countParams);

  res.json({ orders: parsed, total, page: Number(page), limit: Number(limit) });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, tracking_number, notes } = req.body;

  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
  if (!status || !validStatuses.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${validStatuses.join(', ')}`);
  }

  const updates = ['status = ?'];
  const params = [status];

  if (status === 'shipped') {
    updates.push('shipped_at = NOW()');
    if (tracking_number) {
      updates.push('tracking_number = ?');
      params.push(tracking_number);
    }
  }

  if (notes !== undefined) {
    updates.push('notes = ?');
    params.push(notes);
  }

  params.push(id);
  const [result] = await pool.query(
    `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
    params
  );

  if (result.affectedRows === 0) throw new ApiError(404, 'Order not found');
  res.json({ success: true });
});

module.exports = { getOrdersByUser, getOrderByEmail, getOrderById, getAllOrders, updateOrderStatus };
