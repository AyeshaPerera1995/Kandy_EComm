const express = require('express');
const router = express.Router();
const request = require('request');
const baseUrl = require('../config/key').baseUrl;

const mainCatController = require('../controllers/mainCatController');

router.get('/viewMainCatProducts/:code', mainCatController.getAllMainCatProducts);


module.exports = router;