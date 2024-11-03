
const mongoose = require('mongoose');

// Define a simple schema for Category
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,  // Ensure category names are unique
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the Category model
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;