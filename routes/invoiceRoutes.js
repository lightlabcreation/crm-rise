// =====================================================
// Invoice Routes
// =====================================================

const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { optionalAuth } = require('../middleware/auth');

// Apply optional auth to all routes to populate req.user, req.userId, req.companyId if token exists
router.use(optionalAuth);

// Routes
router.get('/', invoiceController.getAll);
router.get('/:id', invoiceController.getById);
router.post('/', invoiceController.create);
router.put('/:id', invoiceController.update);
router.delete('/:id', invoiceController.delete);
router.post('/create-from-time-logs', invoiceController.createFromTimeLogs);
router.post('/create-recurring', invoiceController.createRecurring);
router.post('/:id/send-email', invoiceController.sendEmail);
router.get('/:id/pdf', invoiceController.generatePDF);

module.exports = router;

