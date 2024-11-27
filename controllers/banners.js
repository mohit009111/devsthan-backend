
const Banners = require('../models/banners.js');
const path = require('path');
const fs = require('fs');
const bannerImages = {
    homeBanner: [],
    anotherType: [],
};
const addBanner = async (req, res) => {
    const { page } = req.query;  // Get the 'page' query parameter
  
    if (!page) {
        return res.status(400).json({ error: 'Page parameter is required.' });
    }

    try {
        const { bannerUrls } = req.body; // Get the URLs from the request body

        // Check if bannerUrls is missing or if it's an empty array
        if (!bannerUrls || bannerUrls.length === 0) {
            return res.status(400).json({ error: "Banner URLs are missing" });
        }

        // If the page is 'homeBanner', ensure the bannerUrls is an array (multiple images allowed)
        if (page === 'homeBanner' && !Array.isArray(bannerUrls)) {
            return res.status(400).json({ error: "Home banner should be an array of image URLs" });
        }

        // Try to find an existing banner for the page
        const existingBanner = await Banners.findOne({ page });

        if (existingBanner) {
            if (page === 'homeBanner') {
                // If the page is 'homeBanner', allow adding multiple images and merge URLs
                existingBanner.bannerUrls = [...new Set([...existingBanner.bannerUrls, ...bannerUrls])]; // Merge and remove duplicates
            } else {
                // For other pages, replace the current banner with the new one (no multiple images allowed)
                existingBanner.bannerUrls = [bannerUrls[0]]; // Replace with the new image URL (only one image allowed)
            }

            await existingBanner.save();

            res.status(200).json({
                message: `${page} banners updated successfully`,
                data: existingBanner,
            });
        } else {
            // If the banner doesn't exist, create a new one
            if (page === 'homeBanner') {
                // If it's the home banner, allow multiple images
                const newBanner = await Banners.create({ page, bannerUrls });
                res.status(200).json({
                    message: `${page} banners uploaded successfully`,
                    data: newBanner,
                });
            } else {
                // For other pages, only allow a single image
                const newBanner = await Banners.create({ page, bannerUrls: [bannerUrls[0]] });
                res.status(200).json({
                    message: `${page} banner uploaded successfully`,
                    data: newBanner,
                });
            }
        }

    } catch (error) {
        console.error("Error saving or updating banner:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
const deleteBanner = async (req, res) => {
    try {
        const { imageUrl, page } = req.body;

        if (!imageUrl || !page) {
            return res.status(400).json({ message: 'Image URL and page are required.' });
        }

        // Find the document by page
        const bannerDocument = await Banners.findOne({ page });

        if (!bannerDocument) {
            return res.status(404).json({ message: 'Page not found.' });
        }

        // Check if the image URL exists in the bannerUrls array
        const imageIndex = bannerDocument.bannerUrls.indexOf(imageUrl);
        if (imageIndex === -1) {
            return res.status(404).json({ message: 'Image not found.' });
        }

        // Remove the image URL from the array
        bannerDocument.bannerUrls.splice(imageIndex, 1);
        await bannerDocument.save();

        // Optionally, delete the image from the file system if applicable
        const imagePath = path.join(__dirname, '..', 'uploads', path.basename(imageUrl)); // Adjust path as needed
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        res.status(200).json({ message: 'Image deleted successfully.' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};
const getAllBannerImages = async (req, res) => {
    const { page } = req.query;  

    if (!page) {
        return res.status(400).json({ error: 'Page parameter is required' });
    }

    try {
        // Fetch banner data from database (this can be modified to your storage method)
        const banner = await Banners.findOne({ page: page });  // Assuming you're storing banner info in a collection

        if (!banner) {
            return res.status(404).json({ error: `No banner found for page: ${page}` });
        }

        // Assuming your banner object has a `bannerUrls` field that stores the image URLs
        const bannerUrls = banner.bannerUrls;

        return res.json({
            data: {
                bannerUrls: bannerUrls || [],  // If no images, return an empty array
            },
        });
    } catch (error) {
        console.error("Error fetching banners:", error);
        return res.status(500).json({ error: 'Failed to fetch banner images' });
    }
};

module.exports = {
    addBanner,
    getAllBannerImages,
    deleteBanner
  };
  