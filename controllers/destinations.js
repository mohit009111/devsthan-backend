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
        // Create a new destination if no UUID is provided
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

module.exports = {
    createDestination,
    getAllDestinations,
};
