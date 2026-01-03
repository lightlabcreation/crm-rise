const express = require('express');
const router = express.Router();
const zohoBooksController = require('../controllers/zohoBooksController');
// const { protect } = require('../middleware/authMiddleware'); // Add auth middleware if needed later

// Public callback (needs to be accessible by Zoho)
router.get('/callback', zohoBooksController.callback);

// Protected routes (add protect middleware in real prod)
router.get('/settings', zohoBooksController.getSettings);
router.post('/settings', zohoBooksController.updateSettings);
router.get('/connect', zohoBooksController.connect);
router.post('/disconnect', zohoBooksController.disconnect);

module.exports = router;
