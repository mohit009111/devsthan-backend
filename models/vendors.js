const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
