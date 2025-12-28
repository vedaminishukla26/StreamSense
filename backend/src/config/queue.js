const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const logger = require('../utils/logger');

const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
});

connection.on('error', (err) => {
    logger.error(`Redis Connection Error: ${err.message}`);
});

connection.on('connect', () => {
    logger.info('Connected to Redis for Queue');
});

const videoQueue = new Queue('video-processing-queue', { connection });

module.exports = { videoQueue, connection };