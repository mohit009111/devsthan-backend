const Categories = require('../models/categories.js');

// Function to create a new category
const createCategories = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if the category name is provided
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if the category already exists
    const existingCategory = await Categories.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    // Create a new category
    const newCategory = new Categories({ name });

    // Save the new category to the database
    await newCategory.save();

    // Send a success response
    res.status(201).json({ message: 'Category created successfully', category: newCategory });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Function to get all categories
const getCategories = async (req, res) => {
  try {
    // Fetch all categories from the database
    const categories = await Categories.find();

    // Send a successful response with the list of categories
    res.status(200).json(categories);
  } catch (error) {
    // Log and send error response
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const deletedCategory = await Categories.findByIdAndDelete(categoryId);
    
        if (!deletedCategory) {
          return res.status(404).json({ message: 'Category not found' });
        }
    
        res.status(200).json({ message: 'Category deleted successfully' });
      } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Server error' });
      }
    
  };


// Export both functions together
module.exports = {
  createCategories,
  getCategories,
  deleteCategory
};
