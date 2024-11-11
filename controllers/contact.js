const Inquiry = require('../models/inquiry'); 
const Contact = require('../models/contact');
require('dotenv').config();
const nodemailer = require("nodemailer");
console.log(process.env.EMAIL_PASS)

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

    // Send email
 transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: 'Error sending email' });
      }
      console.log("Email sent: " + info.response);
      res.status(201).json({ success: true, data: savedData });
    });

    res.status(201).json({ success: true, data: savedData });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find();
    res.status(200).json({ success: true, data: inquiries });
  } catch (error) {
    console.error('Error retrieving inquiries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json({ success: true, data: contacts });
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
