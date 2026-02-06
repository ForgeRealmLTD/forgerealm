const express = require('express');
const { addSubscriber } = require('../controllers/subscribe.controller');

const router = express.Router();

router.post('/', addSubscriber);

module.exports = router;
