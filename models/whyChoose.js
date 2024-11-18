const mongoose = require('mongoose');

const WhyChooseSchema = new mongoose.Schema({
  bannerImage: {
    type: String,
    required: true,
  },
  uuid: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true, // Automatically manages createdAt and updatedAt
});

module.exports = mongoose.model('WhyChoose', WhyChooseSchema);