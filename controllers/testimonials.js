const Testimonial = require("../models/testimonials.js");
const getAllTestimonials = async (req, res) => {
    try {
      const testimonials = await Testimonial.find();
    
      res.status(200).json(testimonials);
    } catch (error) {
      console.error("Error fetching tours:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  const createTestimonial = async (req, res) => {
    try {
      const { profile, name, description,image } = req.body;
  
     
      const newTestimonial = await Testimonial.create({
        profile,
        name,
        description,
        image
      });
  
      
      res.status(201).json(newTestimonial); // Respond with the created testimonial
    } catch (error) {
      console.error("Error creating testimonial:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
  module.exports = { createTestimonial };
  
  module.exports = {
    getAllTestimonials,
    createTestimonial
  };
