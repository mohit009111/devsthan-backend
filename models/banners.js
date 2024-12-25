const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true,
        unique: true, // Ensure each page has only one banner entry
        enum: [
            'homeBanner',
            'aboutUsBanner',
            'contactBanner',
            'destinationBanner',
            'destinationsBanner',
            'blogBanner',
            'blogsBanner',
            'toursBanner',
        ], // Allow only valid banner types
    },
    bannerUrls: {
        desktop: {
            type: [String], 
            default: [],
        },
        mobile: {
            type: [String],
            default: [],
        },
        tablet: {
            type: [String],
            default: [],
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Add a pre-save hook to update the `updatedAt` field whenever a document is modified
bannerSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Banner', bannerSchema);
