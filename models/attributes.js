const mongoose = require('mongoose');

const subAttributeSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subAttributes: [subAttributeSchema], // Embed sub-attributes directly within the attribute
});

const Attribute = mongoose.model('Attribute', attributeSchema);

module.exports = Attribute;
