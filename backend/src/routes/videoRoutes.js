const express = require('express');
const { initiateUpload, completeUpload } = require('../controllers/uploadController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/upload/initiate', protect, initiateUpload);
router.post('/upload/complete', protect, completeUpload);

module.exports = router;