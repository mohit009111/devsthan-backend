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
  console.log("body",req.body.standardDetails); 
  try {
    const {
      uuid,
      name,
      overview,
      location,
      duration,
      groupSize,
      cancellationPolicy,
      transportation,
      availableDates,
      languages,
      departureDetails,
      additionalInfo,
      standardDetails,
      deluxeDetails,
      categories,
      premiumDetails,
      knowBeforeYouGo,
      fixedDates,
      openHours,
      welcomeDrinks,
      country,
      city,
      state,
      images, 
      bannerImage, 
 
    } = req.body;

    const { destinationId } = req.body;
    if (destinationId) {

      // Check if the tour uuid already exists in the tours array of the Destination
      const destination = await Destination.findOne({ uuid: destinationId });
      
      if (destination) {
        // Check if the tour UUID is already in the 'tours' array
        if (!destination.tours.includes(uuid)) {
          // If not, add it to the tours array
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
    const imageUrls = Array.isArray(images) ? images : [images]; 
    const bannerImageUrl = bannerImage || null;


    let tour = await Tour.findOne({ uuid });

    if (tour) {
  
      tour.name = name;
      tour.destinationId=destinationId;
      tour.overview = overview;
      tour.location = location;
      tour.duration = duration;
      tour.groupSize = groupSize;
      tour.cancellationPolicy = cancellationPolicy;
      tour.transportation = transportation === 'true';
      tour.availableDates = availableDates;
      tour.languages = Array.isArray(languages) ? languages : [languages];
      tour.departureDetails = departureDetails;
      tour.additionalInfo = Array.isArray(additionalInfo) ? additionalInfo : [additionalInfo];
      tour.bannerImage = bannerImageUrl || tour.bannerImage;
      tour.images = imageUrls.length > 0 ? imageUrls : tour.images;
      tour.standardDetails = JSON.parse(standardDetails); // Use parsed object directly
      tour.deluxeDetails = JSON.parse(deluxeDetails);
      tour.premiumDetails = JSON.parse(premiumDetails);
      tour.knowBeforeYouGo = Array.isArray(knowBeforeYouGo) ? knowBeforeYouGo : [knowBeforeYouGo];
      tour.fixedDates = fixedDates;
      tour.openHours = openHours;
      tour.country = country;
      tour.city = city;
      tour.state = state;
      tour.welcomeDrinks = welcomeDrinks;
      tour.categories=categories;

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
        transportation: transportation === 'true',
        availableDates,
        languages: Array.isArray(languages) ? languages : [languages],
        departureDetails,
        additionalInfo: Array.isArray(additionalInfo) ? additionalInfo : [additionalInfo],
        bannerImage: bannerImageUrl,
        images: imageUrls.length > 0 ? imageUrls : [],
        standardDetails: JSON.parse(standardDetails),
        deluxeDetails: JSON.parse(deluxeDetails),
        premiumDetails: JSON.parse(premiumDetails),
        knowBeforeYouGo: Array.isArray(knowBeforeYouGo) ? knowBeforeYouGo : [knowBeforeYouGo],
        fixedDates,
        openHours,
        welcomeDrinks,
        country,
        categories,
        city,
        state,
      });
      const createdTour = await newTour.save();
      return res.status(201).json(createdTour);
    }
  } catch (error) {
    console.error('Error creating tour:', error);
    return res.status(500).json({ error: 'An error occurred while creating the tour.' });
  }
};


const deleteTour = async (req, res) => {
  try {
    const { uuid } = req.params; // Get UUID from request parameters
    console.log(uuid)
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
    console.log(req)
    const { location, tourType, minPrice, maxPrice, durations } = req.body;
    const tours = await Tour.find();
    const filteredTours = tours.filter((tour) => tour.status !== "disabled");

    let filteredToursByLocationAndName = filteredTours;
    if (location) {

      filteredToursByLocationAndName = filteredTours.filter((tour) => {
        const tourLocation = tour.location && tour.location.toLowerCase();
        // console.log(tourLocation)
        const tourName = tour.name && tour.name.toLowerCase();
        // console.log(tourName)
        const matchesLocation = tourLocation === location.toLowerCase();
        console.log(matchesLocation)
        const searchTermWords = location.toLowerCase().split(" ");
        const matchesSearchTerm = searchTermWords.every((word) =>
          tourName.includes(word)
        );
        return matchesLocation || matchesSearchTerm;
      });
    }

    let filteredToursByType = filteredToursByLocationAndName;
    if (tourType && tourType.length > 0) {
      filteredToursByType = filteredToursByLocationAndName.filter((tour) => {
        return tourType.every((tourTypeItem) => {
          return tour.tourType.includes(tourTypeItem);
        });
      });
    }


    let filteredToursByPrice = filteredToursByType;
    if (minPrice && maxPrice) {
      filteredToursByPrice = filteredToursByType.filter((tour) => {
        const tourPrice = parseFloat(tour.cost[0].standardPrice);
        return (
          !isNaN(tourPrice) && tourPrice >= minPrice && tourPrice <= maxPrice
        );
      });
    }

    let filteredToursByDuration = filteredToursByPrice;
    if (durations && durations.length > 0) {
      filteredToursByDuration = filteredToursByPrice.filter((tour) => {
        const tourDurationNumbers = tour.duration.match(/\d+/g);
        const tourDurationNumber = tourDurationNumbers
          ? parseInt(tourDurationNumbers.join(""), 10)
          : 0;

        return durations.every((duration) => {
          return tourDurationNumber >= duration;
        });
      });
    }

    res.status(200).json(filteredToursByDuration);
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
    console.log("params", req.params)
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
    const { tourType, minPrice, maxPrice, durations } = req.body;

    // Fetch all tours (consider adding pagination or filters for large datasets)
    const tours = await Tour.find();

    // Filter by location
    const filteredToursByLocation = tours.filter((tour) => {
      const lowerCaseLocation = location.toLowerCase();

      return (
        (tour.location && tour.location.toLowerCase() === lowerCaseLocation) ||
        (tour.country && tour.country.toLowerCase() === lowerCaseLocation) ||
        (tour.city && tour.city.toLowerCase() === lowerCaseLocation) ||
        (tour.state && tour.state.toLowerCase() === lowerCaseLocation)
      );
    });

    // Conditionally filter by tour type if provided
    let filteredTours = filteredToursByLocation;
    if (tourType && Array.isArray(tourType) && tourType.length > 0) {
      filteredTours = filteredTours.filter((tour) =>
        tourType.every((tourTypeItem) => tour.tourType.includes(tourTypeItem))
      );
    }

    // Conditionally filter by price range if minPrice and maxPrice are provided
    if (typeof minPrice === "number" && typeof maxPrice === "number") {
      filteredTours = filteredTours.filter((tour) => {
        const tourPrice = parseFloat(tour.cost);
        return !isNaN(tourPrice) && tourPrice >= minPrice && tourPrice <= maxPrice;
      });
    }

    // Conditionally filter by duration if durations array is provided
    if (durations && Array.isArray(durations) && durations.length > 0) {
      filteredTours = filteredTours.filter((tour) => {
        const tourDurationNumbers = tour.duration.match(/\d+/g);
        const tourDurationNumber = tourDurationNumbers
          ? parseInt(tourDurationNumbers.join(""), 10)
          : 0;

        return durations.every((duration) => tourDurationNumber >= duration);
      });
    }

    // Respond with the filtered tours
    res.json(filteredTours);
  } catch (error) {
    console.error("Error updating tour:", error);
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
