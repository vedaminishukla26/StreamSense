const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    originalName: { type: String, required: true },
    s3Key: { type: String, required: true }, 
    bucket: { type: String, required: true },
    contentType: { type: String, required: true },
    uploader: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending_upload', 'queued', 'processing', 'completed', 'failed'],
        default: 'pending_upload'
    },
    sensitivity: {
        isSafe: { type: Boolean },
        flags: [{ type: String }],
        processedAt: { type: Date }
    }
}, { timestamps: true });

videoSchema.index({ uploader: 1 });
videoSchema.index({ status: 1 });
videoSchema.index({ 'sensitivity.isSafe': 1, createdAt: -1 });

module.exports = mongoose.model('Video', videoSchema);