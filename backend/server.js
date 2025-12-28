require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');
const connectDB = require('./src/config/db');
require('./src/services/queue/worker');

const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    logger.error(err.name, err.message);
    process.exit(1);
});

const startServer = async () => {
    try {
        await connectDB();
        const server = app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });

        process.on('unhandledRejection', (err) => {
            logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
            logger.error(err.name, err.message);
            server.close(() => {
                process.exit(1);
            });
        });

    } catch (err) {
        logger.error('Failed to connect to DB during startup:', err);
        process.exit(1);
    }
};

startServer();