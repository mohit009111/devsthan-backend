const mongoose = require('mongoose');

const CustomizedQuery = new mongoose.Schema({
    uuid: { type: String, required: true },
    read:{type:Boolean},
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  query: { type: String, required: true },
  noOfAdult: { type: Number, required: true },
  noOfChild: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Query', CustomizedQuery);
