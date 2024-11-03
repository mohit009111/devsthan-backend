// Order.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        
    },
    userDetails: {
        type: Object,
        
    },
    totalPrice: {
        type: Number,
        
    },
    paymentId: {
        type: String,
        
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    addressLine1: {
        type: String,
       
      },
      addressLine2: {
        type: String,
      },
      state: {
        type: String,
      },
      postalCode: {
        type: String,
      },
      specialRequests: {
        type: String,
      },
      bookedTour:{
        type: String,
      },
      vendorId:{
        type: String,
      }
   , status:{
    type: String,
   },
   tourName:{
    type: String,
   }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
