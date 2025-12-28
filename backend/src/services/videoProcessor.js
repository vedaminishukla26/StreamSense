const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs-extra');
const logger = require('../utils/logger');

if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
    logger.info(`FFmpeg binary configured at: ${ffmpegPath}`);
} else {
    logger.error('FFmpeg binary not found in ffmpeg-static package!');
}

const processVideo = (filePath, videoId) => {
    return new Promise((resolve, reject) => {

        if (!fs.existsSync(filePath)) {
            return reject(new Error(`Video file not found at ${filePath}`));
        }

        const screenshotName = `frame-${videoId}.png`;
        const screenshotPath = path.join(path.dirname(filePath), screenshotName);

        logger.info(`Extracting frame from: ${filePath}`);

        ffmpeg(filePath)
            .screenshots({
                timestamps: ['00:00:01'],
                filename: screenshotName,
                folder: path.dirname(filePath),
            })
            .on('end', async () => {
                logger.info('Frame extracted successfully.');
                
                const stats = await fs.stat(filePath);
                const isSafe = stats.size < 5 * 1024 * 1024; 
                
                const result = {
                    isSafe: isSafe,
                    flags: isSafe ? [] : ['high_file_size_detected'],
                    processedAt: new Date()
                };
                try {
                    await fs.unlink(filePath);
                    await fs.unlink(screenshotPath);
                } catch (err) {
                    logger.warn(`Cleanup failed: ${err.message}`);
                }

                resolve(result);
            })
            .on('error', (err) => {
                logger.error(`FFmpeg Error: ${err.message}`);
                reject(err);
            });
    });
};

module.exports = { processVideo };