const { Worker } = require('bullmq');
const logger = require('../../utils/logger');
const { connection } = require('../../config/queue');
const Video = require('../../models/Video');

const worker = new Worker('video-processing-queue', async (job) => {
    logger.info(`Job ${job.id} started. Processing videoId: ${job.data.videoId}`);

    try {
        const video = await Video.findById(job.data.videoId);
        if (!video) throw new Error(`Video not found: ${job.data.videoId}`);

        video.status = 'processing';
        await video.save();

        logger.info(`Analyzing content for ${video.originalName}... (Simulated)`);
        await new Promise(resolve => setTimeout(resolve, 5000));

        video.status = 'completed';
        video.sensitivity = {
            isSafe: true,
            processedAt: new Date()
        };
        await video.save();

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