const express = require('express');
const upload = require('../middleware/upload');
const { requireAdmin } = require('../middleware/auth.middleware');
const {
  getProducts,
  getProductById,
  createProduct
} = require('../controllers/products.controller');

const router = express.Router();

router.get('/', requireAdmin, getProducts);
router.get('/:id', getProductById);
router.post('/', requireAdmin, upload.array('images', 5), createProduct);

module.exports = router;