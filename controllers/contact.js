const Inquiry = require('../models/inquiry');
const Contact = require('../models/contact');
const axios = require('axios');
require('dotenv').config();
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const createInquiryOrContact = async (req, res) => {
  try {
    const { fullName, email, message, phone, uuid } = req.body;

    if (!fullName || !email || !message || !phone) {
      return res.status(400).json({ error: 'Full Name, Email, Message, and Phone are required' });
    }

    let savedData;
    if (uuid) {
      savedData = await Inquiry.create({ fullName, email, message, phone, uuid });
    } else {
      savedData = await Contact.create({ fullName, email, message, phone });
    }

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for your inquiry/contact!",
      text: `Hi ${fullName},\n\nThank you for reaching out! We have received your message: "${message}".\n\nWe'll get back to you shortly.\n\nBest regards,\nDevsthan Expert`
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: 'Error sending email' });
      }
      console.log("Email sent: " + info.response);
      res.status(201).json({ success: true, data: savedData });
    });
    try {
      const aisensyPayload = {
        apiKey: process.env.AISENSY_API_KEY,
        campaignName: "whatsapp message",
        destination: phone.startsWith('91') ? phone : `91${phone}`, // Assuming you want to prefix with country code
        userName: "Devsthan expert chatbot",
        templateParams: [],
        source: "new-landing-page form",
        media: {},
        buttons: [],
        carouselCards: [],
        location: {},
        paramsFallbackValue: {}
      };

      const aisensyResponse = await axios.post('https://api.aisensy.com/v1/messaging/send', aisensyPayload, {
        headers: {
          'Authorization': `Bearer ${aisensyPayload.apiKey}`, // Ensure you are using the API key safely
          'Content-Type': 'application/json'
        }
      });
      console.log('WhatsApp message sent via Aisensy:', aisensyResponse.data);
    } catch (error) {
      console.error('Error sending WhatsApp message via Aisensy:', error.response ? error.response.data : error.message);
    }

    res.status(201).json({ success: true, data: savedData });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });

    // Format the createdAt field for each inquiry
    const formattedInquiries = inquiries.map(inquiry => ({
      ...inquiry.toObject(),
      createdAt: new Date(inquiry.createdAt).toLocaleString()
    }));

    res.status(200).json({ success: true, data: formattedInquiries });
  } catch (error) {
    console.error('Error retrieving inquiries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    // Format the createdAt field for each contact
    const formattedContacts = contacts.map(contact => ({
      ...contact.toObject(),
      createdAt: new Date(contact.createdAt).toLocaleString()
    }));

    res.status(200).json({ success: true, data: formattedContacts });
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createInquiryOrContact,
  getAllInquiries,
  getAllContacts
};
