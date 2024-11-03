// controllers/attributesController.js
const Attribute = require('../models/attributes.js');

// Create a new attribute
const createAttribute = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if the attribute name is provided
    if (!name) {
      return res.status(400).json({ message: 'Attribute name is required' });
    }

    // Check if the attribute already exists
    const existingAttribute = await Attribute.findOne({ name });
    if (existingAttribute) {
      return res.status(400).json({ message: 'Attribute already exists' });
    }

    // Create a new attribute
    const newAttribute = new Attribute({ name });

    // Save the new attribute to the database
    await newAttribute.save();

    // Send a success response
    res.status(201).json({ message: 'Attribute created successfully', attribute: newAttribute });
  } catch (error) {
    console.error('Error creating attribute:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all attributes
const getAttributes = async (req, res) => {
  try {
    // Fetch all attributes from the database
    const attributes = await Attribute.find();
  
    // Send a successful response with the list of attributes
    res.status(200).json(attributes);
  } catch (error) {
    // Log and send error response
    console.error('Error fetching attributes:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
const addSubAttribute = async (req, res) => {
    const { id } = req.params;
  const { name } = req.body;

  try {
    const attribute = await Attribute.findById(id);
    if (!attribute) {
      return res.status(404).json({ message: 'Attribute not found' });
    }

    attribute.subAttributes.push({ name });
    await attribute.save();
    res.status(201).json(attribute);
  } catch (error) {
    res.status(500).json({ message: 'Error adding sub-attribute' });
  }
  };

  const deleteAttribute = async (req, res) => {
    try {
        const attributeId = req.params.id;
        const deletedAttribute = await Attribute.findByIdAndDelete(attributeId);
    
        if (!deletedAttribute) {
          return res.status(404).json({ message: 'Attribute not found' });
        }
    
        res.status(200).json({ message: 'Attribute deleted successfully' });
      } catch (error) {
        console.error('Error deleting attribute:', error);
        res.status(500).json({ message: 'Server error' });
      }
  };

  const deleteSubattribute = async (req, res) => {
    try {
        const { attributeId, subAttributeId } = req.params;
    
        const attribute = await Attribute.findById(attributeId);
        if (!attribute) {
          return res.status(404).json({ message: 'Attribute not found' });
        }
    
        // Filter out the sub-attribute to be deleted
        attribute.subAttributes = attribute.subAttributes.filter(sub => sub._id.toString() !== subAttributeId);
    
        await attribute.save(); // Save the updated attribute
    
        res.status(200).json({ message: 'Sub-attribute deleted successfully' });
      } catch (error) {
        console.error('Error deleting sub-attribute:', error);
        res.status(500).json({ message: 'Server error' });
      }
  };
  
  module.exports = { createAttribute, getAttributes, addSubAttribute ,deleteSubattribute,deleteAttribute};