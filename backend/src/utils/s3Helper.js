const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/s3');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

const generatePresignedUrl = async (bucket, key) => {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

const downloadFromS3 = async (bucket, key, destinationPath) => {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });

    const response = await s3Client.send(command);
    
    const dir = path.dirname(destinationPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await pipeline(response.Body, fs.createWriteStream(destinationPath));
    return destinationPath;
};

module.exports = { downloadFromS3, generatePresignedUrl };
