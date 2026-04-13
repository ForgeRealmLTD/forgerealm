const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const {
  getOrdersByUser,
  getOrderByEmail,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orders.controller');

const router = express.Router();

// User-facing
router.get('/', requireAuth, getOrdersByUser);
router.get('/lookup', getOrderByEmail); // Guest lookup by email
router.get('/:id', requireAuth, getOrderById);

// Admin
router.get('/admin/all', requireAdmin, getAllOrders);
router.put('/:id/status', requireAdmin, updateOrderStatus);

module.exports = router;
