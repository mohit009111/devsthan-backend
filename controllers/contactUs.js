// server/controllers/contactController.js
const Contact = require('../models/contactForm');

const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const newContact = new Contact({
      name,
      email,
      subject,
      message,
    });
    const savedContact = await newContact.save();
    res.status(201).json({ message: 'Form submitted successfully', contact: savedContact });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  submitContactForm,
};
