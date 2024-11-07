const Destinations = require('../models/destinations');

const createDestination = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const {
      uuid, // UUID for identification
      description,
      country,
      state,
      city,
      population,
      languages,
      capitalCity,
      subDestinations,
      highlights,
      bannerImage,
      images
    } = req.body;

    // Check if a destination with the given state already exists
    if (!uuid) {
      const existingDestination = await Destinations.findOne({ state });
      if (existingDestination) {
        return res.status(400).json({ message: 'Destination with this state already exists' });
      }
    }

    // Check if a destination with the given UUID exists
    let updatedDestination;
    if (uuid) {
      updatedDestination = await Destinations.findOneAndUpdate(
        { uuid },
        {
          uuid, // Ensure UUID is part of the document
          description,
          country,
          state,
          city,
          population,
          languages,
          capitalCity,
          subDestinations,
          highlights,
          bannerImage,
          images
        },
        { new: true, upsert: true } // `upsert: true` creates if not found
      );
    } else {
      // Create a new destination if no UUID is provided and state is unique
      updatedDestination = new Destinations({
        uuid,
        description,
        country,
        state,
        city,
        population,
        languages,
        capitalCity,
        subDestinations,
        highlights,
        bannerImage,
        images
      });

      await updatedDestination.save();
    }

    res.status(201).json({ message: 'Destination saved successfully', destination: updatedDestination });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to save destination', error: error.message });
  }
};


const getAllDestinations = async (req, res) => {
    console.log(req.body)
    try {
        // Retrieve all destinations from the database
        const destinations = await Destinations.find();
        res.status(200).json(destinations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch destinations', error: error.message });
    }
};

const getDestinationById = async (req, res) => {
  const { uuid } = req.params; // Extract the ID from the URL parameters

  try {

    // Find the destination by ID
    const destination = await Destinations.findOne({uuid});

    // Check if the destination was found
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    // Send the destination data as the response
    res.status(200).json(destination);
  } catch (error) {
    // Handle errors (e.g., invalid ID format, server issues)
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
    createDestination,
    getAllDestinations,
    getDestinationById
};
