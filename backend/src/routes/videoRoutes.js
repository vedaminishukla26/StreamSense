const express = require('express');
const { initiateUpload, completeUpload } = require('../controllers/uploadController');
const { getMyVideos, getVideoById } = require('../controllers/videoController')
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/upload/initiate', protect, initiateUpload);
router.post('/upload/complete', protect, completeUpload);

router.get('/', protect, getMyVideos);
router.get('/:id', protect, getVideoById);

module.exports = router;