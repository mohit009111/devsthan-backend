const { connect } = require("mongoose");
const express = require('express');
const Tour = require("../models/tour");
const Destination = require("../models/destinations");
const User = require("../models/users");
const multer = require('multer');
const app = express();

const cloudinary = require('cloudinary').v2;

// Middleware to parse JSON bodies
app.use(express.json());

const createTour = async (req, res) => {
  console.log("Received body:", req.body);
  try {
    // Parse `tourData` from req.body if it exists and is a JSON string
    const tourData = typeof req.body.tourData === "string" ? JSON.parse(req.body.tourData) : req.body;

    // Destructure properties from the parsed tourData
    const {
      welcomeDrinks,
      transportation,
      siteSeen,
      meals,
      hotel,
      uuid,
      name,
      overview,
      location,
      duration,
      groupSize,
      cancellationPolicy,
      availableDates,
      languages,
      departureDetails,
      additionalInfo,
      standardDetails,
      deluxeDetails,
      premiumDetails,
      categories,
      knowBeforeYouGo,
      fixedDates,
      openHours,
      
      country,
      city,
      state,
      termsAndConditions,
      images,
      bannerImage,
    } = tourData;

    const { destinationId } = tourData;

  

    // Check if a destination ID exists and handle the destination updates
    if (destinationId) {
      const destination = await Destination.findOne({ uuid: destinationId });

      if (destination) {
        // Check if the tour UUID is already in the 'tours' array
        if (!destination.tours.includes(uuid)) {
          await Destination.findOneAndUpdate(
            { uuid: destinationId },
            { $push: { tours: uuid } }
          );
          console.log("Tour UUID added to Destination.");
        } else {
          console.log("Tour UUID already exists in Destination.");
        }
      } else {
        console.log("Destination not found.");
      }
    }

    // Prepare image URLs
    const imageUrls = Array.isArray(images) ? images : [images];
    const bannerImageUrl = bannerImage || null;

    // Check if the tour already exists
    let tour = await Tour.findOne({ uuid });

    if (tour) {
      // Update the existing tour
      tour.name = name;
      tour.transportation=transportation,
      tour.siteSeen=siteSeen,
      tour.meals=meals,
      tour.hotel=hotel,
      tour.destinationId = destinationId;
      tour.overview = overview;
      tour.location = location;
      tour.duration = duration;
      tour.groupSize = groupSize;
      tour.termsAndConditions=termsAndConditions;
      tour.cancellationPolicy = cancellationPolicy;
      tour.availableDates = availableDates;
      tour.languages = Array.isArray(languages) ? languages : [languages];
      tour.departureDetails = departureDetails;
      tour.additionalInfo = Array.isArray(additionalInfo) ? additionalInfo : [additionalInfo];
      tour.bannerImage = bannerImageUrl || tour.bannerImage;
      tour.images = imageUrls.length > 0 ? imageUrls : tour.images;
      tour.standardDetails = standardDetails;
      tour.deluxeDetails = deluxeDetails;
      tour.premiumDetails = premiumDetails;
      tour.knowBeforeYouGo = Array.isArray(knowBeforeYouGo) ? knowBeforeYouGo : [knowBeforeYouGo];
      tour.fixedDates = fixedDates;
      tour.openHours = openHours;
      tour.country = country;
      tour.city = city;
      tour.state = state;
      tour.welcomeDrinks = welcomeDrinks;
      tour.categories = categories;

      const updatedTour = await tour.save(); // Save the updated tour
      return res.status(200).json(updatedTour);
    } else {
      // Create a new tour
      const newTour = new Tour({
        uuid,
        name,
        overview,
        location,
        destinationId,
        duration,
        groupSize,
        cancellationPolicy,
        termsAndConditions,
        availableDates,
        languages: Array.isArray(languages) ? languages : [languages],
        departureDetails,
        additionalInfo: Array.isArray(additionalInfo) ? additionalInfo : [additionalInfo],
        bannerImage: bannerImageUrl,
        images: imageUrls.length > 0 ? imageUrls : [],
        standardDetails,
        deluxeDetails,
        premiumDetails,
        knowBeforeYouGo,
        fixedDates,
        openHours,
        welcomeDrinks,
        transportation,
        siteSeen,
        meals,
        hotel,
        country,
        categories,
        city,
        state,
      });

      const createdTour = await newTour.save();
      return res.status(201).json(createdTour);
    }
    
  } catch (error) {
    console.error("Error creating tour:", error);
    return res.status(500).json({ error: "An error occurred while creating the tour." });
  }
};

const deleteTour = async (req, res) => {
  try {
    const { uuid } = req.params; // Get UUID from request parameters

    // Check if the tour exists
    const deletedTour = await Tour.findOneAndDelete({ uuid });

    if (!deletedTour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Respond with a success message
    res.status(200).json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};


const getAllTours = async (req, res) => {
  try {
    const { location, tourType, minPrice, maxPrice, durations } = req.body;
    const tours = await Tour.find();
    if (!tours || tours.length === 0) {
      return res.status(404).json({ error: "No tours found." });
    }

    let filteredTours = tours;
    if (location) {
      const searchTerm = location.toLowerCase().replace(/-/g, ' ');
    
      filteredTours = filteredTours.filter((tour) => {
        const tourLocation = tour.location?.toLowerCase() || "";
        const tourState = tour.state?.toLowerCase() || "";
        const tourCity = tour.city?.toLowerCase() || "";
        const tourCountry = tour.country?.toLowerCase() || "";

        return (
          tourLocation.includes(searchTerm) ||
          tourState.includes(searchTerm) ||
          tourCity.includes(searchTerm) ||
          tourCountry.includes(searchTerm)
        );
      }); }
    if (tourType && Array.isArray(tourType) && tourType.length > 0) {
      filteredTours = filteredTours.filter((tour) => {
        return (
          Array.isArray(tour.categories) &&
          tourType.every((type) =>
            tour.categories.some(
              (category) => category.toLowerCase() === type.toLowerCase()
            )
          )
        );
      });
    }
    if (minPrice != null && maxPrice != null) {
      filteredTours = filteredTours.filter((tour) => {
        const tourPrice = tour.standardDetails?.pricing?.[0]?.price;
        return (
          !isNaN(tourPrice) &&
          tourPrice >= parseFloat(minPrice) &&
          tourPrice <= parseFloat(maxPrice)
        );
      });
    }

    if (durations && Array.isArray(durations) && durations.length > 0) {
      filteredTours = filteredTours.filter((tour) => {
        const tourDuration = parseInt(tour.duration, 10);
        return durations.every((duration) => tourDuration >= parseInt(duration, 10));
      });

      console.log(`Tours after duration filter: ${filteredTours.length}`);
    }
    res.status(200).json(filteredTours);
  } catch (error) {
    console.error("Error fetching tours:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const getToursForVendor = async (req, res) => {
  try {
    const { vendorId } = req.body;
    const tours = await Tour.find({ vendor: vendorId });
    res.status(200).json(tours);
  } catch (error) {
    console.error("Error fetching vendor tours:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getTourDetails = async (req, res) => {
  try {
   
    const tourId = req.params.tourId;

    const tours = await Tour.find({ uuid: tourId });

    res.status(200).json(tours)

  } catch (error) {
    console.error("Error fetching vendor tours:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const updateTour = async (req, res) => {
  try {
    const { tourId } = req.params;
    const { comment, email } = req.body;

    if (comment) {
      const existingTour = await Tour.findOne({ uuid: tourId });

      if (!existingTour) {
        return res.status(404).json({ error: "Tour not found" });
      }


      existingTour.reviews.push(req.body);

      const updatedTour = await existingTour.save();
      return res.json({ message: "Tour updated successfully", tour: updatedTour });
    }

    const updatedTour = await Tour.findOneAndUpdate(
      { uuid: tourId },
      req.body,
      { new: true } // This option ensures that the updated document is returned
    );

    if (!updatedTour) {
      return res.status(404).json({ error: "Tour not found" });
    }

    return res.json({ message: "Tour updated successfully", tour: updatedTour });
  } catch (error) {
    console.error("Error updating tour:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getToursByLocationDate = async (req, res) => {
  try {
    const { location, date } = req.params;

    const tours = await Tour.find();
    const filteredTours = tours.filter((tour) => tour.status !== "disabled");

    const filteredToursByLocationAndName = filteredTours.filter((tour) => {
      const tourLocation = tour.location && tour.location.toLowerCase();
      const tourName = tour.name && tour.name.toLowerCase();
      const matchesLocation = tourLocation === location.toLowerCase();
      const searchTermWords = location.toLowerCase().split(" ");
      const matchesSearchTerm = searchTermWords.every((word) =>
        tourName.includes(word)
      );
      return matchesLocation || matchesSearchTerm;
    });

    res.json(filteredToursByLocationAndName);
  } catch (error) {
    console.error("Error updating tour:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getToursByFilter = async (req, res) => {
  try {
    const { location } = req.params;

    if (!location) {
      return res.status(400).json({ error: "Location parameter is required" });
    }

    // Use Mongoose to query directly for matching tours by state
    const lowerCaseLocation = location.toLowerCase();
    const filteredToursByLocation = await Tour.find({
      state: { $regex: new RegExp(`^${lowerCaseLocation}$`, "i") } // Case-insensitive match
    });

    // Respond with the filtered tours
    res.status(200).json(filteredToursByLocation);
  } catch (error) {
    console.error("Error fetching tours by location:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = {
  createTour,
  getAllTours,
  getToursForVendor,
  getTourDetails,
  updateTour,
  deleteTour,
  // getToursByLocationDate,
  getToursByFilter,
  // imageUpload
};
