const { Worker } = require('bullmq');
const logger = require('../../utils/logger');
const { connection } = require('../../config/queue');
const Video = require('../../models/Video');
const { downloadFromS3 } = require('../../utils/s3Helper');
const { processVideo } = require('../videoProcessor');
const path = require('path');

const worker = new Worker('video-processing-queue', async (job) => {
    logger.info(`Job ${job.id} started. Processing videoId: ${job.data.videoId}`);

    try {
        const video = await Video.findById(job.data.videoId);
        if (!video) throw new Error(`Video not found: ${job.data.videoId}`);

        video.status = 'processing';
        await video.save();
        const { s3Key, bucket } = job.data;
        const tempFilePath = path.join(__dirname, '../../../temp', `vid-${job.data.videoId}.mp4`);
        logger.info(`Downloading from S3...`);
        await downloadFromS3(bucket, s3Key, tempFilePath);

        logger.info(`Analyzing content...`);
        const analysisResult = await processVideo(tempFilePath, job.data.videoId)
        video.status = 'completed'
        video.sensitivity = analysisResult

        await video.save()

        logger.info(`Job ${job.id} finished! Video marked as completed.`);
        
    } catch (error) {
        logger.error(`Job ${job.id} failed: ${error.message}`);
        
        const video = await Video.findById(job.data.videoId);
        if (video) {
            video.status = 'failed';
            await video.save();
        }
        throw error;
    }
}, { connection });

worker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed with error ${err.message}`);
});

module.exports = worker;