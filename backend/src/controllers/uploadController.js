const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const s3Client = require('../config/s3');
const Video = require('../models/Video');
const logger = require('../utils/logger');
const { videoQueue } = require('../config/queue');

exports.initiateUpload = async (req, res) => {
    try {
        const { fileName, fileType } = req.body;
        const userId = req.user._id;

        const fileKey = `uploads/${userId}/${uuidv4()}-${fileName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
            ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

        const newVideo = await Video.create({
            title: fileName,
            originalName: fileName,
            s3Key: fileKey,
            bucket: process.env.AWS_BUCKET_NAME,
            contentType: fileType,
            uploader: userId,
            status: 'pending_upload'
        });

        res.status(200).json({
            uploadUrl,
            videoId: newVideo._id,
            fileKey
        });
        
    } catch (error) {
        logger.error(`Upload Initiate Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error initializing upload' });
    }
};

exports.completeUpload = async (req, res) => {
    const { videoId } = req.body;
    
    try {
        const video = await Video.findById(videoId);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        if (video.uploader.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        video.status = 'queued';
        await video.save();

        await videoQueue.add('analyze-video', { 
            videoId: video._id,
            s3Key: video.s3Key,
            bucket: video.bucket
        });

        logger.info(`Video ${videoId} added to processing queue`);

        res.status(200).json({ 
            message: 'Upload verified, processing started', 
            status: 'queued',
            video 
        });
    } catch (error) {
        logger.error(`Upload Complete Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error completing upload' });
    }
};