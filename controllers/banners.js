const Banners = require('../models/banners.js');
const path = require('path');
const fs = require('fs');

// Add a new banner or update an existing one
const addBanner = async (req, res) => {
    const { page } = req.query;

    if (!page) {
        return res.status(400).json({ error: 'Page parameter is required.' });
    }

    try {
        const { desktop, mobile, tablet } = req.body;

        // Validate that we have arrays for each device
        if (!Array.isArray(desktop) || !Array.isArray(mobile) || !Array.isArray(tablet)) {
            return res.status(400).json({ error: 'Each device (desktop, mobile, tablet) must be an array.' });
        }

        // Find existing banner by page
        const existingBanner = await Banners.findOne({ page });

        // Prepare the banner data for updating or creating
        const bannerData = {
            desktop: desktop || [],
            mobile: mobile || [],
            tablet: tablet || []
        };

        if (existingBanner) {
            // Update the banner URLs for the existing banner entry
            existingBanner.bannerUrls = bannerData;
            await existingBanner.save();
            return res.status(200).json({
                message: `${page} banners updated successfully.`,
                data: existingBanner,
            });
        }

        // Create a new banner entry with the separate device URLs
        const newBanner = await Banners.create({
            page,
            bannerUrls: bannerData,
        });

        res.status(201).json({
            message: `${page} banners uploaded successfully.`,
            data: newBanner,
        });
    } catch (error) {
        console.error('Error adding or updating banner:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Delete a banner image
const deleteBanner = async (req, res) => {
    try {
        console.log('DELETE /api/deleteBannerImage hit');
        
        // Extract and log request data
        const { imageUrl, page, device } = req.body;
        console.log('Request Data:', { imageUrl, page, device });

        // Validate request body
        if (!imageUrl || !page || !device) {
            console.error('Validation error: Missing parameters');
            return res.status(400).json({ success: false, error: 'Image URL, page, and device are required.' });
        }

        // Validate device type
        const validDevices = ['desktop', 'mobile', 'tablet'];
        if (!validDevices.includes(device)) {
            console.error('Validation error: Invalid device type');
            return res.status(400).json({ success: false, error: 'Invalid device type. Must be desktop, mobile, or tablet.' });
        }

        // Fetch the document by page
        const bannerDocument = await Banners.findOne({ page });
        if (!bannerDocument) {
            console.error('Error: Page not found');
            return res.status(404).json({ success: false, error: 'Page not found.' });
        }

        console.log('Fetched Banner Document:', bannerDocument);

        // Validate the existence of the `bannerUrls` object and the specific device array
        const deviceArray = bannerDocument?.bannerUrls?.[device];
        if (!deviceArray || !Array.isArray(deviceArray)) {
            console.error(`Error: No banners found for the ${device} device`);
            return res.status(404).json({ success: false, error: `No banners found for the ${device} device.` });
        }

        // Find the image index in the device array
        const imageIndex = deviceArray.indexOf(imageUrl);
        if (imageIndex === -1) {
            console.error('Error: Image not found in the specified device array');
            return res.status(404).json({ success: false, error: 'Image not found in the specified device array.' });
        }

        console.log('Index of Image URL:', imageIndex);

        // Remove the image from the array
        deviceArray.splice(imageIndex, 1);
        console.log('Updated Device Array:', deviceArray);

        // Save the updated document
        bannerDocument.markModified(`bannerUrls.${device}`);
        await bannerDocument.save();

        // Send success response
        console.log('Image deletion successful.');
        return res.status(200).json({ success: true, message: `Image deleted successfully from the ${device} array.` });
    } catch (error) {
        console.error('Unexpected error occurred:', error);
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
};

// Get all banner images for a specific page
const getAllBannerImages = async (req, res) => {
    const { page } = req.query;

    if (!page) {
        return res.status(400).json({ error: 'Page parameter is required.' });
    }

    try {
        const banner = await Banners.findOne({ page });

        if (!banner) {
            return res.status(404).json({ error: `No banners found for page: ${page}` });
        }

        res.status(200).json({
            data: {
                bannerUrls: banner.bannerUrls || [],
            },
        });
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports = {
    addBanner,
    deleteBanner,
    getAllBannerImages,
};
