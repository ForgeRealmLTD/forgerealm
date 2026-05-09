const express = require('express');
const { listReceipts, downloadReceipt, downloadTemplate } = require('../controllers/receipts.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/template',  requireAdmin, downloadTemplate);
router.get('/',          requireAdmin, listReceipts);
router.get('/:id/pdf',   requireAdmin, downloadReceipt);

module.exports = router;
