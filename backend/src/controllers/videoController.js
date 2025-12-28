const Video = require('../models/Video');
const { generatePresignedUrl } = require('../utils/s3Helper');
const logger = require('../utils/logger');

exports.getMyVideos = async (req, res) => {
    try {
        const videos = await Video.find({ uploader: req.user._id })
            .sort({ createdAt: -1 });
        res.status(200).json(videos);
    } catch (error) {
        logger.error(`Get Videos Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getVideoById = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        
        if (!video) return res.status(404).json({ message: 'Video not found' });

        if (video.uploader.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const videoUrl = await generatePresignedUrl(video.bucket, video.s3Key);

        res.status(200).json({
            ...video.toObject(),
            videoUrl
        });

    } catch (error) {
        logger.error(`Get Video Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
};