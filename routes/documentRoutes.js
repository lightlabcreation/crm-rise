const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

// No authentication required - all routes are public
const documentFolderController = require('../controllers/documentFolderController');

// Folder Routes
router.get('/folders', documentFolderController.getAll);
router.post('/folders', documentFolderController.create);
router.delete('/folders/:id', documentFolderController.deleteFolder);

// Document Routes
router.get('/', documentController.getAll);
router.get('/:id', documentController.getById);
router.post('/', uploadSingle('file'), handleUploadError, documentController.create);
router.delete('/:id', documentController.deleteDocument);
router.get('/:id/download', documentController.download);

module.exports = router;

