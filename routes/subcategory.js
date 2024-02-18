const express = require('express');
const router = express.Router();

const subCatController = require('../controllers/subCatController');

router.get('/viewSubCatProducts/:code', subCatController.getAllSubCatProducts);


module.exports = router;