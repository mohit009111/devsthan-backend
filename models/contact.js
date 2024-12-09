const mongoose = require('mongoose');


const contactSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  },
  message: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
  },
  read: { type: Boolean, default: false },
 
}, {
  timestamps: true, 
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
