const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User model
  tours: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tour' }] // Array of tour ids in the wishlist
}, { timestamps: true }); // Adding timestamps for createdAt and updatedAt

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
