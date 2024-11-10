const Inquiry = require('../models/inquiry'); 
const Contact = require('../models/contact');

const createInquiryOrContact = async (req, res) => {
  try {
    const { fullName , email, message, phone, uuid } = req.body;
    console.log(fullName)
    console.log(email)
    console.log(message)
    console.log(phone)
    console.log(uuid)
    if (!fullName || !email || !message || !phone) {
      return res.status(400).json({ error: 'Full Name, Email, Message, and Phone are required' });
    }

    let savedData;
    if (uuid) {
      savedData = await Inquiry.create({ fullName, email, message, phone, uuid });
    } else {
      savedData = await Contact.create({ fullName, email, message, phone });
    }
    res.status(201).json({ success: true, data: savedData });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
    createInquiryOrContact,
};
