const mongoose = require('mongoose');

// Cart Schema
const cartSchema = new mongoose.Schema({
  tourId: {
    type: String, // Assuming the tourId is a string (UUID)
    required: true,
  },
  category:{
    type: String, // Assuming the tourId is a string (UUID)
    required: true,
  },
  adults: {
    type: Number,
    required: true,
  },
  children: {
    type: Number,
    required: true,
  },
  userTempId: {
    type: String,
   
  },
  userId:{
    type: String,
  },
  totalPrice:{
    type: Number,
  },
  selectedRooms:{
    type: Number,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
