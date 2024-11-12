const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  bannerImage: {
    type: String, // URL for the banner image
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
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
