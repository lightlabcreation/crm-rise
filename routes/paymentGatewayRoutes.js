const express = require('express');
const router = express.Router();
const paymentGatewayController = require('../controllers/paymentGatewayController');

// Get all gateways
router.get('/', paymentGatewayController.getGateways);

// Update a gateway
router.post('/update', paymentGatewayController.updateGateway);

module.exports = router;
