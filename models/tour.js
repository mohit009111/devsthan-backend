const mongoose = require('mongoose');

const tourDetailsSchema = new mongoose.Schema({
  uuid: { type: String, default: null },
  name: { type: String, default: null },
  overview: { type: String, default: null },
  location: { type: String, default: null },
  duration: { type: String },
  transportation: { type: Boolean, default: false },
  groupSize: { type: String },
  availableDates: { type: String },
  departureDetails: { type: String },
  knowBeforeYouGo: [{ type: String }],
  additionalInfo: [{ type: String }],
  bannerImage: { type: String, default: null },
  images: [{ type: String }],
  country:{ type: String },
  city:{ type: String },
  state:{ type: String },

  // Fixed Dates details
  fixedDates: {
    enabled: { type: Boolean, default: false },
    seatsAvailable: { type: Number, default: 0 },
    priceChangePerPerson: { type: Number, default: 0 },
  },

  // Open Hours details
  openHours: {
    enabled: { type: Boolean, default: false },
    pricePerPerson: { type: Number, default: 0 },
    groupSize: { type: Number, default: 0 },
    maxPeople: { type: Number, default: 0 },
  },
  welcomeDrinks: {
    type: Boolean
  },
  standardDetails: {
    pricing: [
      {
        day: Number,
        price: Number
      }
    ],
    cancellationPolicy: { type: String },
    highlights: [{ type: String }],
    whatsIncluded: [{ type: String }],
    whatsExcluded: [{ type: String }],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    itineraries: [
      {
        title: { type: String },
        duration: { type: String },
        meals: {
          breakfast: {
            isAvailable: { type: Boolean, default: false },
            name: { type: String, default: '' },
            photos: [{ type: String }]  // array of photo URLs
          },
          lunch: {
            isAvailable: { type: Boolean, default: false },
            name: { type: String, default: '' },
            photos: [{ type: String }]
          },
          dinner: {
            isAvailable: { type: Boolean, default: false },
            name: { type: String, default: '' },
            photos: [{ type: String }]
          }
        }
        ,
        image: { type: String },
        description: { type: String },
        day: { type: Number },
        hotelName: { type: String },
        hotelUrl: { type: String },
        siteSeenPhotos: { type: [String], default: [] },
        hotelPhotos: { type: [String], default: [] },
        managerName: { type: String },
        managerImage: { type: String },

        carName: { type: String },
        carPhotos: [{ type: String }],
        transportation: { type: Boolean },






      },
    ],
  },

  deluxeDetails: {
    pricing: [
      {
        day: Number,
        price: Number
      }
    ],
    cancellationPolicy: { type: String },
    highlights: [{ type: String }],
    whatsIncluded: [{ type: String }],
    whatsExcluded: [{ type: String }],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    itineraries: [
      {
        title: { type: String },
        duration: { type: String },
        meals: {
          breakfast: {
            isAvailable: { type: Boolean, default: false },
            name: { type: String, default: '' },
            photos: [{ type: String }]  // array of photo URLs
          },
          lunch: {
            isAvailable: { type: Boolean, default: false },
            name: { type: String, default: '' },
            photos: [{ type: String }]
          },
          dinner: {
            isAvailable: { type: Boolean, default: false },
            name: { type: String, default: '' },
            photos: [{ type: String }]
          }
        }
        ,
        image: { type: String },
        description: { type: String },
        day: { type: Number },
        hotelName: { type: String },
        hotelUrl: { type: String },
        siteSeenPhotos: { type: [String], default: [] },
        hotelPhotos: { type: [String], default: [] },
        managerName: { type: String },
        managerImage: { type: String },
        carName: { type: String },
        carPhotos: [{ type: String }],
        transportation: { type: Boolean },

      },
    ],
  },

  premiumDetails: {
    pricing: [
      {
        day: Number,
        price: Number
      }
    ],
    cancellationPolicy: { type: String },
    highlights: [{ type: String }],
    whatsIncluded: [{ type: String }],
    whatsExcluded: [{ type: String }],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    itineraries: [
      {
        title: { type: String },
        duration: { type: String },
        meals: {
          breakfast: {
            isAvailable: { type: Boolean, default: false },
            name: { type: String, default: '' },
            photos: [{ type: String }]  // array of photo URLs
          },
          lunch: {
            isAvailable: { type: Boolean, default: false },
            name: { type: String, default: '' },
            photos: [{ type: String }]
          },
          dinner: {
            isAvailable: { type: Boolean, default: false },
            name: { type: String, default: '' },
            photos: [{ type: String }]
          }
        }
        ,
        image: { type: String },
        description: { type: String },
        day: { type: Number },
        hotelName: { type: String },
        hotelUrl: { type: String },
        siteSeenPhotos: { type: [String], default: [] },
        hotelPhotos: { type: [String], default: [] },
        managerName: { type: String },
        managerImage: { type: String },
        carName: { type: String },
        carPhotos: [{ type: String }],
        transportation: { type: Boolean },

      },
    ],
  },

  createdAt: { type: Date, default: Date.now },
  status: { type: String },
  reviews: [{ text: String, email: String, comment: String }],
});

const Tour = mongoose.model('Tour', tourDetailsSchema);

module.exports = Tour;
