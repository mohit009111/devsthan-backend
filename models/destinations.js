const mongoose = require('mongoose');

const DestinationSchema = new mongoose.Schema({
    uuid: String,
    bannerImage: String, // Store image URL or base64 string
    description: String,
    images: [String], // Array of image URLs or base64 strings
    population: String,
    languages: String,
    capitalCity: String,
    country: {


        label: String,
        value: String,
    },
    city: {


        label: String,
        value: String,
    },
    state: {


        label: String,
        value: String,
    },
    subDestinations: [
        {
            name: String,
            description: String,
            photos: [String], // Array of image URLs or base64 strings
        },
    ],
    highlights: [
        {
            image: String, // Image URL or base64 string
            heading: String,
            subHeading: String,
        },
    ],
});

module.exports = mongoose.model('Destination', DestinationSchema);