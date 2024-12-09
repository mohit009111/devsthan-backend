const mongoose = require('mongoose');

// Order Schema
const orderSchema = new mongoose.Schema({

    username: {
        type: String, // Assuming this references a User model
       

    },
    userId:{
        type: String, // Assuming tourId is a string
    },
    tourId: {
        type: String, // Assuming tourId is a string

    },
    category: {
        type: String, // Assuming category is a string (like 'adults', 'children', etc.)

    },
    rooms: {  // Add rooms to the schema
        type: Array,
       
      },
    totalPrice: {
        type: Number, // Store the total price (in cents or currency unit)

    },
    paymentId: {
        type: String, // Store the payment ID from Razorpay

    },

    address: {
        type: String, // Shipping or billing address

    },
    mobile: {
        type: String, // Shipping or billing address

    },
    email: {
        type: String, // Shipping or billing address

    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set to current date/time
    },
    status: {
        type: String,
        default: 'pending', 
    },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
