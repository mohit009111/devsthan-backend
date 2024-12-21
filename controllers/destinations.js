const Destinations = require('../models/destinations');
const Tour = require('../models/tour') 
const { v4: uuidv4 } = require('uuid');

const createDestination = async (req, res) => {
  try {
    const {
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
      images,
    } = req.body;

    let updatedDestination;

    if (uuid) {
      // Check if a destination with the given UUID exists
      const existingDestination = await Destinations.findOne({ uuid });

      if (existingDestination) {
        // Update the existing destination
        updatedDestination = await Destinations.findOneAndUpdate(
          { uuid }, // Find by UUID
          {
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
            images,
          },
          { new: true } // Return the updated document
        );
      } else {
        // Create a new destination if the UUID doesn't match any existing entry
        updatedDestination = new Destinations({
          uuid, // Use provided UUID
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
          images,
        });
        await updatedDestination.save();
      }
    } else {
      // Create a new destination when no UUID is provided
      updatedDestination = new Destinations({
        uuid: uuidv4(), // Generate a new UUID
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
        images,
      });
      await updatedDestination.save();
    }

    res.status(201).json({
      message: "Destination saved successfully",
      updatedDestination,
    });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: "Failed to save destination", error: error.message });
  }
};


const getAllDestinations = async (req, res) => {
   
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
const getAllLocations = async (req, res) => {
  try {
    // Fetch destinations with selected fields
    const destinations = await Destinations.find({}, 'country city state');

    // Fetch tours with `location` field
    const tours = await Tour.find({}, 'location');

    
    const uniqueLocationsSet = new Set();

   
    destinations.forEach(dest => {
      if (dest.country?.label) uniqueLocationsSet.add(dest.country.label);
      if (dest.state?.label) uniqueLocationsSet.add(dest.state.label);
      if (dest.city?.label) uniqueLocationsSet.add(dest.city.label);
    });

    // Add `location` from tours to the Set
    tours.forEach(tour => {
      if (tour.location) uniqueLocationsSet.add(tour.location);
    });

    // Convert the Set back to an array
    const mergedLocationsArray = Array.from(uniqueLocationsSet);

    // Structure the response
    const response = {
      destinations: mergedLocationsArray
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "An error occurred while fetching locations" });
  }
};


module.exports = {
    createDestination,
    getAllDestinations,
    getDestinationById,
    getAllLocations
};
