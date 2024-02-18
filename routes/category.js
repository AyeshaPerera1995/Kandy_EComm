const express = require('express');
const router = express.Router();
const request = require('request');
const baseUrl = require('../config/key').baseUrl;

const catController = require('../controllers/catController');

router.get('/viewCatProducts/:code', catController.getAllCatProducts);


module.exports = router;