const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true,
        unique: true, // Ensure each page has only one banner entry
        enum: ['homeBanner', 'aboutUsBanner', 'contactBanner', 'destinationBanner', 'destinationsBanner', 'blogBanner', 'blogsBanner', 'toursBanner'],  // Ensure only valid banner types
    },
    bannerUrls: {
        type: [String], // Array of strings to store multiple URLs
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Banner', bannerSchema);
