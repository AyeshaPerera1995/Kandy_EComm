const express = require('express');
const router = express.Router();

const proController = require('../controllers/proController');

router.get('/single_product/:id', proController.getSingleProductDetails);

module.exports = router;